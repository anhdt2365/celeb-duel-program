use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};
use vipers::invariant;

declare_id!("3p2vXr5dLy6dN8ehJZ5NEvDkmrPCz7PBj2YMQEsvpURW");

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

pub use constants::*;
pub use errors::*;
pub use instructions::*;
pub use state::*;

#[program]
pub mod celeb_duel_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, test_mode: bool) -> Result<()> {
        let bump = *ctx.bumps.get("duel_config_account").unwrap();
        initialize::exec(ctx, bump, test_mode)
    }

    pub fn change_mode(ctx: Context<ChangeMode>, test_mode: bool) -> Result<()> {
        change_mode::exec(ctx, test_mode)
    }

    pub fn create_duel(
        ctx: Context<CreateDuel>,
        id: u64,
        start_date: u64,
        end_date: u64,
    ) -> Result<()> {
        let bump = *ctx.bumps.get("duel_account").unwrap();
        let token_one_bump = *ctx.bumps.get("duel_token_one_account").unwrap();
        let token_two_bump = *ctx.bumps.get("duel_token_two_account").unwrap();
        create_duel::exec(
            ctx,
            id,
            bump,
            token_one_bump,
            token_two_bump,
            start_date,
            end_date,
        )
    }

    pub fn vote_one(ctx: Context<VoteOne>) -> Result<()> {
        let bump = *ctx.bumps.get("user_account").unwrap();
        vote_one::exec(
          ctx,
          bump
        )
    }

    pub fn vote_two(ctx: Context<VoteTwo>) -> Result<()> {
        let bump = *ctx.bumps.get("user_account").unwrap();
        vote_two::exec(ctx, bump)
    }

    pub fn announce_winner(ctx: Context<AnnounceWinner>) -> Result<()> {
        announce_winner::exec(ctx)
    }
}
