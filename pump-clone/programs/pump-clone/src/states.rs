use anchor_lang::prelude::*;

#[account]
pub struct CurveConfiguration {
    pub owner: Pubkey,
    pub token_mint: Pubkey,
    pub virtual_sol_reserve: u64,
    pub virtual_token_reserve: u64,
    pub real_token_reserve: u64,
    pub real_sol_reserve: u64,
}

impl CurveConfiguration {
    pub const LEN: usize = 8 + 32 + 32 + 8 * 4;
}
