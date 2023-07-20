use crate::*;

#[derive(Accounts)]
pub struct ChangeMode<'info> {
    #[account(
        mut,
        address = duel_config_account.admin @ CelebDuelErrorCode::OnlyAdmin,
    )]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [DUEL_CONFIG_SEED, duel_config_account.admin.as_ref()],
        bump = duel_config_account.bump[0],
    )]
    pub duel_config_account: Account<'info, DuelConfig>,
    pub system_program: Program<'info, System>,
}

pub fn exec(ctx: Context<ChangeMode>, test_mode: bool) -> Result<()> {
    let duel_config = &mut ctx.accounts.duel_config_account;

    invariant!(duel_config.test_mode != test_mode, CelebDuelErrorCode::ModeNotChange);

    duel_config.change_mode(test_mode)
}
