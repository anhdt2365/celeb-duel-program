use anchor_spl::token;
use crate::*;

#[derive(Accounts)]
pub struct AnnounceWinner<'info> {
    #[account(
        mut,
        address = duel_config_account.admin @ CelebDuelErrorCode::OnlyAdmin,
    )]
    pub authority: Signer<'info>,
    #[account(
        mut,
        token::authority = authority,
    )]
    pub authority_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        address = duel_account.duel_config_account @ CelebDuelErrorCode::InvalidDuelAndDuelConfigAccount,
        seeds = [DUEL_CONFIG_SEED, duel_config_account.admin.as_ref()],
        bump = duel_config_account.bump[0],
    )]
    pub duel_config_account: Account<'info, DuelConfig>,
    #[account(
        mut,
        seeds = [DUEL_SEED, &duel_account.id.to_le_bytes()],
        bump = duel_account.bump[0],
    )]
    pub duel_account: Account<'info, Duel>,
    #[account(
        mut,
        seeds = [DUEL_TOKEN_ONE_SEED, duel_account.key().as_ref()],
        bump = duel_account.token_one_bump[0],
    )]
    pub duel_token_one_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        seeds = [DUEL_TOKEN_TWO_SEED, duel_account.key().as_ref()],
        bump = duel_account.token_two_bump[0],
    )]
    pub duel_token_two_account: Box<Account<'info, TokenAccount>>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn exec(ctx: Context<AnnounceWinner>) -> Result<()> {
    let duel = &mut ctx.accounts.duel_account;
    let admin_token_account = &ctx.accounts.authority_token_account;

    let now = Clock::get().unwrap().unix_timestamp as u64;
    invariant!(
        now >= duel.end_date,
        CelebDuelErrorCode::DuelIsGoingOn
    );
    let mut duel_token_winner_account = &ctx.accounts.duel_token_one_account;
    let mut token_winner = duel.token_one;
    let mut withdraw_amount = duel.total_vote_one;
    if duel.total_vote_one < duel.total_vote_two {
        duel.winner = 2;
        duel_token_winner_account = &ctx.accounts.duel_token_two_account;
        token_winner = duel.token_two;
        withdraw_amount = duel.total_vote_two;
    } else if duel.total_vote_one > duel.total_vote_two {
        duel.winner = 1;
    } else {
        duel.winner = 3;
        return Ok(());
    }

    invariant!(token_winner == admin_token_account.mint, CelebDuelErrorCode::InvalidAdminTokenAccount);

    // Withdraw Winner vault to Admin
    let seeds = &[
        DUEL_SEED,
        &duel.id.to_le_bytes(),
        &[duel.bump[0]],
    ];
    let signer = &[&seeds[..]];
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: duel_token_winner_account.to_account_info(),
                to: ctx.accounts.authority_token_account.to_account_info(),
                authority: ctx.accounts.duel_account.to_account_info(),
            },
            signer,
        ),
        withdraw_amount,
    )?;
    Ok(())
}
