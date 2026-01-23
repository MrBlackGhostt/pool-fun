use anchor_lang::prelude::*;
pub mod instructions;
pub mod states;

use instructions::*; // Imports buy, sell, initialize_curve

declare_id!("4gLCJXsTLAxQVjqnTETFwf4WKE8MQUdpgGy4oULD6rMh");

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

    pub fn buy_token(ctx: Context<BuyToken>, amount: u64) -> Result<()> {
        let bump = ctx.bumps.curve_config;
        ctx.accounts.buy_token(amount, bump)?;
        Ok(())
    }

    pub fn sell_token(ctx: Context<Sell>, amount: u64) -> Result<()> {
        let bump = ctx.bumps.curve_config;
        ctx.accounts.sell(amount, bump)?;
        Ok(())
    }
}
