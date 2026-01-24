use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::errors::ErrorsCode::NotGraduatedYet;
use crate::states::CurveConfiguration;


#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub mint_creator: Signer<'info>,

    #[account(mut, seeds=[b"bonding-pump", mint_creator.key().as_ref()] ,bump ) ]
    pub curve_config: Account<'info, CurveConfiguration>,

    #[account(mut,  seeds = [b"bonding-pump-mint", mint_creator.key().as_ref()], 
        bump                                               )]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(mut,
        associated_token::mint=mint, 
        associated_token::authority=curve_config)]
    pub curve_ata: InterfaceAccount<'info,TokenAccount> ,

    #[account(mut,
        associated_token::mint=mint, 
        associated_token::authority=mint_creator)]
    pub mint_creator_ata: InterfaceAccount<'info,TokenAccount> ,


    pub token_program:Interface<'info,TokenInterface>,
    pub associated_token_program: Program<'info,AssociatedToken>,
    pub system_program: Program<'info,System>
}
impl <'info>Withdraw<'info> {
   pub  fn withdraw(&mut self, bump:u8) -> Result<()> {
    if self.curve_config.is_graduated {
        
        let token_amount = self.curve_config.real_token_reserve;

//       let min_rent = Rent::get()?.minimum_balance(CurveConfiguration::LEN);
// let current_lamports = self.curve_config.to_account_info().lamports();
// let withdrawable_sol = current_lamports.saturating_sub(min_rent);
// msg!("Current lamports: {}, Min rent: {}, Withdrawable: {}", 
//      current_lamports, min_rent, withdrawable_sol);
let seeds= &[b"bonding-pump", self.mint_creator.key.as_ref(), &[bump]];
let signer_seeds = &[&seeds[..]];
// Transfer the withdrawable SOL
// if withdrawable_sol > 0 {
//     self.curve_config.sub_lamports(withdrawable_sol)?;
//     self.mint_creator.add_lamports(withdrawable_sol)?;
//} 
        let ctx_token_acc = TransferChecked{
                mint: self.mint.to_account_info(),
                from: self.curve_ata.to_account_info(),
                to: self.mint_creator_ata.to_account_info(),
                authority: self.curve_config.to_account_info()
            };
        
      
        let ctx_token = CpiContext::new(self.token_program.to_account_info(), ctx_token_acc).with_signer(signer_seeds);
        
        token_interface::transfer_checked(ctx_token, token_amount, self.mint.decimals)?;

self.curve_config.real_sol_reserve = 0;
self.curve_config.real_token_reserve = 0;

        Ok(())
        }
        else {
 return Err(error!(NotGraduatedYet))
        }

} 
}
