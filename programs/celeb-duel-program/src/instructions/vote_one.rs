use crate::*;
use anchor_spl::token::{mint_to, MintTo, Token};

#[derive(Accounts)]
pub struct VoteOne<'info> {
    #[account(mut)]
    pub fee_payer: Signer<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
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
        init_if_needed,
        seeds = [USER_SEED, duel_account.key().as_ref(), authority.key().as_ref()],
        bump,
        payer = fee_payer,
        space = User::LEN,
    )]
    pub user_account: Account<'info, User>,
    #[account(
        mut,
        seeds = [DUEL_TOKEN_ONE_SEED, duel_account.key().as_ref()],
        bump = duel_account.token_one_bump[0],
    )]
    pub duel_token_one_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        address = duel_account.token_one @ CelebDuelErrorCode::InvalidMint,
    )]
    pub token_one: Box<Account<'info, Mint>>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn exec(ctx: Context<VoteOne>, bump: u8) -> Result<()> {
    let duel_config = &mut ctx.accounts.duel_config_account;
    let duel = &mut ctx.accounts.duel_account;
    let user = &mut ctx.accounts.user_account;

    let now = Clock::get().unwrap().unix_timestamp as u64;
    invariant!(
        now >= duel.start_date && now <= duel.end_date,
        CelebDuelErrorCode::NotInVoteTime
    );
    duel.vote_one();

    if !user.initialized {
        user.initialize(bump, duel.key(), ctx.accounts.authority.key());
    } else {
        invariant!(
            user.duel_account == duel.key(),
            CelebDuelErrorCode::InvalidUserAndDuelAccount,
        );
    }

    msg!("Token minting:");
    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.token_one.to_account_info(),
                to: ctx.accounts.duel_token_one_account.to_account_info(),
                authority: duel.to_account_info(),
            },
            &[&[DUEL_SEED, &duel.id.to_le_bytes(), &[duel.bump[0]]]],
        ),
        10u64.pow(u32::from(ctx.accounts.token_one.decimals)) * 10,
    )?;
    msg!("Token Minted!!!");

    // `true` mean vote for number one
    user.vote(true, duel_config.test_mode)
}
