use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

use crate::states::CurveConfiguration;

pub fn initialize_curve(ctx: Context<Initialize>) -> Result<()> {
    let curve_config = &mut ctx.accounts.curve_config;
    curve_config.owner = ctx.accounts.signer.key();
    curve_config.token_mint = ctx.accounts.token_mint.key();
    
    // Initial Bonding Curve State (Pump.fun Defaults)
    // 30 SOL virtual liquidity
    curve_config.virtual_sol_reserve = 30 * 1_000_000_000; 
    // 1 Billion Tokens (Virtual)
    curve_config.virtual_token_reserve = 1_000_000_000 * 1_000_000; 
    // 1 Billion Tokens (Real - all minted to curve initially)
    curve_config.real_token_reserve = 1_000_000_000 * 1_000_000;
    // 0 Real SOL initially
    curve_config.real_sol_reserve = 0;

    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    
    #[account(
        init, 
        space = CurveConfiguration::LEN,
        payer = signer, 
        seeds = [b"bonding-pump", signer.key.as_ref()], 
        bump
    )]
    pub curve_config: Account<'info, CurveConfiguration>,

    #[account(
        init, 
        payer = signer,
        mint::decimals = 6, 
        mint::authority = curve_config, 
        seeds = [b"bonding-pump-mint", signer.key.as_ref()], 
        bump
    )]
    pub token_mint: InterfaceAccount<'info, Mint>,

    #[account(                                                                                                 
        init, 
        payer = signer, 
        associated_token::mint = token_mint, 
        associated_token::authority = curve_config
    )]
    pub curve_ata: InterfaceAccount<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}
