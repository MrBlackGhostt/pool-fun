use anchor_lang::prelude::*;
pub mod errors;
pub mod instructions;
pub mod states;

use instructions::*; // Imports buy, sell, initialize_curve

declare_id!("9V7u5GQaQmvE4QuBNXC7ZxLDG8wE9twdegMA5JtXnKGv");

#[program]
pub mod pump_clone {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        initialize_curve(ctx, name, symbol, uri)?;
        Ok(())
    }

    pub fn buy_token(
        ctx: Context<BuyToken>,
        _name: String,
        amount: u64,
        min_token_out: u64,
    ) -> Result<()> {
        let bump = ctx.bumps.curve_config;
        ctx.accounts.buy_token(amount, bump, min_token_out)?;
        Ok(())
    }

    pub fn sell_token(
        ctx: Context<Sell>,
        _name: String,
        amount: u64,
        min_sol_out: u64,
    ) -> Result<()> {
        let bump = ctx.bumps.curve_config;
        ctx.accounts.sell(amount, bump, min_sol_out)?;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, _name: String) -> Result<()> {
        let bump = ctx.bumps.curve_config;
        ctx.accounts.withdraw(bump)?;
        Ok(())
    }
}
