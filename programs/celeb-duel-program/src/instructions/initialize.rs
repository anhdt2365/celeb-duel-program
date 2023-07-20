use crate::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub fee_payer: Signer<'info>,
    #[account(
        init,
        seeds = [DUEL_CONFIG_SEED, &authority.key().as_ref()],
        bump,
        payer = fee_payer,
        space = DuelConfig::LEN,
    )]
    pub duel_config_account: Account<'info, DuelConfig>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn exec(
    ctx: Context<Initialize>,
    bump: u8,
    test_mode: bool,
) -> Result<()> {
    let duel_config = &mut ctx.accounts.duel_config_account;
    duel_config.init(bump, ctx.accounts.authority.key(), test_mode)
}