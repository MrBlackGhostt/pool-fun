use anchor_lang::prelude::*;
use  anchor_lang::system_program::{Transfer, transfer};
use anchor_spl::{associated_token::AssociatedToken,  token_interface::{self, Mint, MintTo, TokenAccount, TokenInterface,TransferChecked, transfer_checked}};


use crate::states::CurveConfiguration;

#[derive(Accounts)]
pub struct BuyToken<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub mint_creator: UncheckedAccount<'info>,
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
      pub  fn buy_token (&mut self, amount_in:u64, bump:u8)-> Result<()>{
        let old_sol_reserve = self.curve_config.virtual_sol_reserve;
    let new_sol_reserves = old_sol_reserve + amount_in;
                            let old_virtual_token = self.curve_config.virtual_token_reserve;
        
    let product = old_sol_reserve * old_virtual_token;

    let new_token_reserve = product/new_sol_reserves  + 1; 

    let token_out = old_virtual_token - new_token_reserve;
         
        self.curve_config.virtual_sol_reserve = new_sol_reserves;
        self.curve_config.virtual_token_reserve = new_token_reserve;
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
