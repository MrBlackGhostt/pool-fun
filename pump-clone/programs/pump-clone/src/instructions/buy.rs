
use anchor_lang::prelude::*;
use  anchor_lang::system_program::{Transfer, transfer};
use anchor_spl::{associated_token::AssociatedToken,  token_interface::{self, Mint,  TokenAccount, TokenInterface,TransferChecked }};


use crate::states::CurveConfiguration;

const ADMIN_PUBKEY: Pubkey = pubkey!("Ex4xuNjnbmL7sbaM18WrgAMEv3LqurNQ379bUpWS4Xj3");

#[derive(Accounts)]
pub struct BuyToken<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
/// CHECK: mint_creator in the buy
    pub mint_creator: UncheckedAccount<'info>,
/// CHECK: Validated against ADMIN_PUBKEY constant
#[account(mut, address = ADMIN_PUBKEY)]
    pub admin: AccountInfo<'info>,

    #[account(mut, seeds=[b"bonding-pump", mint_creator.key().as_ref()] ,bump ) ]
    pub curve_config: Account<'info, CurveConfiguration>,

    #[account(mut,  seeds = [b"bonding-pump-mint", mint_creator.key().as_ref()], 
        bump                                               )]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(mut,
        associated_token::mint=mint, 
        associated_token::authority=curve_config)]
    pub curve_ata: InterfaceAccount<'info,TokenAccount> ,

    #[account(init_if_needed,payer=user, associated_token::mint=mint,
  associated_token::authority=user  )]
pub user_ata: InterfaceAccount<'info, TokenAccount>  ,
    pub token_program: Interface<'info,TokenInterface>,
    pub associated_token_program:Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>
}

impl <'info>BuyToken<'info> {
      pub  fn buy_token (&mut self,mut amount_in:u64, bump:u8)-> Result<()>{
            // Fee calculation: 1% via integer division
            // Note: Trades < 100 lamports pay 0% fee (intentional - lowers barrier for small traders)
            // Strategy: Fee on BUY only (not on SELL) to reduce exit friction
            let fee = amount_in * 1/ 100 ;

        amount_in -= fee;

         let fee_acc = Transfer{
            from: self.user.to_account_info(),
            to: self.admin.to_account_info()
        };
            
        
        let ctx_fee = CpiContext::new(self.system_program.to_account_info(), fee_acc);


        transfer(ctx_fee, fee)?;
        let old_sol_reserve = self.curve_config.virtual_sol_reserve as u128;
        let new_sol_reserves = old_sol_reserve + amount_in as u128;
        let old_virtual_token = self.curve_config.virtual_token_reserve as u128;


        let product = old_sol_reserve * old_virtual_token;

        let new_token_reserve = (product/new_sol_reserves) as u64 + 1; 

        let token_out = old_virtual_token as u64 - new_token_reserve;
         
        self.curve_config.virtual_sol_reserve = new_sol_reserves as u64;
        self.curve_config.virtual_token_reserve = new_token_reserve as u64;
        self.curve_config.real_token_reserve = self.curve_config.real_token_reserve - token_out;
        self.curve_config.real_sol_reserve += amount_in;

    let cpi_accounts= TransferChecked{
            mint: self.mint.to_account_info(),
            from:self.curve_ata.to_account_info(),
            to: self.user_ata.to_account_info(),
            authority: self.curve_config.to_account_info()
        }                                                ;
        let mint_creator = self.mint_creator.key.as_ref();
    

   
  

    let signer_seeds = &[b"bonding-pump", mint_creator, &[bump]];
        let seed = &[&signer_seeds[..]];

    let cpi_context =        CpiContext::new(self.token_program.to_account_info(), cpi_accounts).with_signer(seed);
                            let decimals = self.mint.decimals;
        token_interface::transfer_checked(cpi_context,                  token_out, decimals)?;

        let sol_transfeir_account = Transfer{
            from: self.user.to_account_info(),
        to: self.curve_config.to_account_info()
    
        }                        ;
        let sol_transfer_ctx = CpiContext::new(self.system_program.to_account_info(), sol_transfeir_account);
         transfer(sol_transfer_ctx,amount_in )?;

        Ok(())
    }
}
