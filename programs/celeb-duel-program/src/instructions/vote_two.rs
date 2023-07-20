use crate::*;
use anchor_spl::token::{mint_to, MintTo, Token};

#[derive(Accounts)]
pub struct VoteTwo<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
      mut,
      address = duel_config_account.admin @ CelebDuelErrorCode::InvalidMintAuthority,
    )]
    pub mint_authority: Signer<'info>,
    #[account(
      mut,
    )]
    pub fee_payer: Signer<'info>,
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
        seeds = [DUEL_TOKEN_TWO_SEED, duel_account.key().as_ref()],
        bump = duel_account.token_two_bump[0],
    )]
    pub duel_token_two_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        address = duel_account.token_two @ CelebDuelErrorCode::InvalidMint,
    )]
    pub token_two: Box<Account<'info, Mint>>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn exec(ctx: Context<VoteTwo>, bump: u8) -> Result<()> {
    let duel_config = &mut ctx.accounts.duel_config_account;
    let duel = &mut ctx.accounts.duel_account;
    let user = &mut ctx.accounts.user_account;

    let now = Clock::get().unwrap().unix_timestamp as u64;
    invariant!(
        now >= duel.start_date || now <= duel.end_date,
        CelebDuelErrorCode::NotInVoteTime
    );
    duel.vote_two();

    if !user.initialized {
        user.initialize(bump, duel.key(), ctx.accounts.authority.key());
    } else {
        invariant!(
            user.duel_account == duel.key(),
            CelebDuelErrorCode::InvalidUserAndDuelAccount,
        );
    }

    msg!("Token minting:");
    let cpi_accounts = MintTo {
        mint: ctx.accounts.token_two.to_account_info(),
        to: ctx.accounts.duel_token_two_account.to_account_info(),
        authority: ctx.accounts.mint_authority.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    let result = mint_to(
        cpi_ctx,
        10_i32
            .pow(ctx.accounts.token_two.decimals.into())
            .try_into()
            .unwrap(),
    );
    if let Err(_) = result {
        return Err(error!(CelebDuelErrorCode::MintFailed));
    }
    msg!("Token Minted!!!");

    // `false` mean vote for number two
    user.vote(false, duel_config.test_mode)
}
