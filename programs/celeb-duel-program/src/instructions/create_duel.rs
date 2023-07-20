use crate::*;

#[derive(Accounts)]
#[instruction(
    id: u64
)]
pub struct CreateDuel<'info> {
    #[account(
        mut,
        address = duel_config_account.admin @ CelebDuelErrorCode::OnlyAdmin,
    )]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub fee_payer: Signer<'info>,
    #[account(
        mut,
        seeds = [DUEL_CONFIG_SEED, duel_config_account.admin.as_ref()],
        bump = duel_config_account.bump[0],
    )]
    pub duel_config_account: Account<'info, DuelConfig>,
    #[account(
        init,
        seeds = [DUEL_SEED, id.to_le_bytes().as_ref()],
        bump,
        payer = fee_payer,
        space = Duel::LEN,
    )]
    pub duel_account: Account<'info, Duel>,
    #[account(
        init,
        token::mint = token_one,
        token::authority = duel_account,
        seeds = [DUEL_TOKEN_ONE_SEED, duel_account.key().as_ref()],
        bump,
        payer = fee_payer,
    )]
    pub duel_token_one_account: Box<Account<'info, TokenAccount>>,
    #[account(
        init,
        token::mint = token_two,
        token::authority = duel_account,
        seeds = [DUEL_TOKEN_TWO_SEED, duel_account.key().as_ref()],
        bump,
        payer = fee_payer,
    )]
    pub duel_token_two_account: Box<Account<'info, TokenAccount>>,
    pub token_one: Box<Account<'info, Mint>>,
    #[account(
        constraint = token_two.key() != token_one.key() @ CelebDuelErrorCode::MustDifferentMint,
    )]
    pub token_two: Box<Account<'info, Mint>>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn exec(
    ctx: Context<CreateDuel>,
    id: u64,
    bump: u8,
    token_one_bump: u8,
    token_two_bump: u8,
    start_date: u64,
    end_date: u64,
) -> Result<()> {
    invariant!(start_date <= end_date, CelebDuelErrorCode::InvalidVoteTime);

    let duel_config = &mut ctx.accounts.duel_config_account;
    let duel = &mut ctx.accounts.duel_account;

    // Update latest Duel ID
    duel_config.new_duel();

    duel.init(
        id,
        duel_config.key(),
        bump,
        token_one_bump,
        token_two_bump,
        ctx.accounts.token_one.key(),
        ctx.accounts.token_two.key(),
        ctx.accounts.duel_token_one_account.key(),
        ctx.accounts.duel_token_two_account.key(),
        start_date,
        end_date,
    )
}
