use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked},
};
use anchor_lang::system_program::{Transfer, transfer}; 
use crate::states::CurveConfiguration;

pub fn sell(ctx: Context<Sell>, amount: u64) -> Result<()> {
    // Implement sell logic here
    Ok(())
}

#[derive(Accounts)]
pub struct Sell<'info> {
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

impl <'info> Sell<'info>{

   pub fn sell(&mut self, token_in:u64, bump:u8)-> Result<()>{
    let old_sol_res = self.curve_config.virtual_sol_reserve;
    let old_token_res= self.curve_config.virtual_token_reserve; // this is used to calculate
        // the amount of token to give or take 
        // the amount of 

let product = old_token_res * old_sol_res;
    
    let new_token_rev = self.curve_config.virtual_token_reserve + token_in;
    let new_sol_out = product/new_token_rev;
    
        // sol to transfer to the user 
    let sol_out = old_sol_res - new_sol_out;
    //
      
    self.curve_config.virtual_token_reserve = new_token_rev;
    self.curve_config.virtual_sol_reserve = new_sol_out ;
    self.curve_config.real_sol_reserve -= sol_out;    
    self.curve_config.real_token_reserve += token_in;

    let account_ctx = TransferChecked{
            mint:self.mint.to_account_info(),
            from: self.user_ata.to_account_info(),
            to: self.curve_ata.to_account_info(),
            authority: self.user.to_account_info()
        };
let mint_creator = self.mint_creator.key.as_ref();
let seeds = &[b"bonding-pump", mint_creator, &[bump]];

        let signer_seeds = &[&seeds[..]]; 

    let ctx = CpiContext::new(self.token_program.to_account_info(),account_ctx); 
let decimals = self.mint.decimals;

    token_interface::transfer_checked(ctx , token_in, decimals)?;

 let sol_transfeir_account = Transfer{
            from: self.curve_config.to_account_info(),
        to: self.user.to_account_info()
    
        }                        ;
        let sol_transfer_ctx = CpiContext::new(self.system_program.to_account_info(), sol_transfeir_account).with_signer(signer_seeds);
         transfer(sol_transfer_ctx,sol_out)?;


        Ok(())
    }
}
