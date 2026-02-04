use anchor_lang::prelude::*;
use anchor_spl::metadata::{
    create_metadata_accounts_v3, mpl_token_metadata::types::DataV2, CreateMetadataAccountsV3,
    Metadata, ID as METADATA_PROGRAM_ID,
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{self, Mint, MintTo, TokenAccount, TokenInterface},
};

use crate::states::CurveConfiguration;

pub fn initialize_curve(
    ctx: Context<Initialize>,
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {
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

    let token_mint_key = ctx.accounts.token_mint.key();
    let signer_seeds = &[
        b"bonding-pump",
        token_mint_key.as_ref(),
        &[ctx.bumps.curve_config],
    ];
    let signer = &[&signer_seeds[..]];
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.token_mint.to_account_info(),
            to: ctx.accounts.curve_ata.to_account_info(),
            authority: curve_config.to_account_info(), // Must match mint authority
        },
        signer, // Add the seeds here!
    );
    token_interface::mint_to(cpi_ctx, curve_config.real_token_reserve)?;

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_metadata_program.to_account_info(),
        CreateMetadataAccountsV3 {
            metadata: ctx.accounts.metadata.to_account_info(),
            mint: ctx.accounts.token_mint.to_account_info(),
            mint_authority: ctx.accounts.curve_config.to_account_info(),
            payer: ctx.accounts.signer.to_account_info(),
            update_authority: ctx.accounts.curve_config.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        },
        signer,
    );

    let data_v2 = DataV2 {
        name: name,
        symbol: symbol,
        uri: uri,
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
        uses: None,
    };

    create_metadata_accounts_v3(cpi_ctx, data_v2, true, true, None)?;
    Ok(())
}

#[derive(Accounts)]
#[instruction(name:String)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init, 
        space = CurveConfiguration::LEN,
        payer = signer, 
        seeds = [b"bonding-pump", token_mint.key().as_ref()], 
        bump
    )]
    pub curve_config: Account<'info, CurveConfiguration>,

    #[account(
        init, 
        payer = signer,
        mint::decimals = 6, 
        mint::authority = curve_config, 
        seeds = [b"bonding-pump-mint", signer.key.as_ref(),name.as_bytes()], 
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

    /// CHECK: this is the metadata pda which will be created by metaplex program
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    pub rent: Sysvar<'info, Rent>,

    ///CHECK: this is the metaplex token metadata program
    #[account(address = METADATA_PROGRAM_ID)]
    pub token_metadata_program: Program<'info, Metadata>,

    pub system_program: Program<'info, System>,
}
