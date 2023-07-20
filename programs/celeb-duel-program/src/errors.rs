use crate::*;

#[error_code]
pub enum CelebDuelErrorCode {
    #[msg("Only Admin")]
    OnlyAdmin,
    #[msg("Only Vote Account owner")]
    OnlyAccountOwner,
    #[msg("Mode not change")]
    ModeNotChange,
    #[msg("Duel must be between 2 different mint")]
    MustDifferentMint,
    #[msg("Invalid Duel and Duel Config Account")]
    InvalidDuelAndDuelConfigAccount,
    #[msg("Invalid User and Duel Account")]
    InvalidUserAndDuelAccount,
    #[msg("Invalid Mint")]
    InvalidMint,
    #[msg("Vote Account already init")]
    AccountAlreadyInit,
    #[msg("Not in voting period")]
    NotInVoteTime,
    #[msg("Only one vote per day")]
    OnlyOneVote,
    #[msg("Start date must be smaller than end date")]
    InvalidVoteTime,
    #[msg("Invalid Mint Authority")]
    InvalidMintAuthority,
    #[msg("Mint failed")]
    MintFailed,
    #[msg("Duel is going on")]
    DuelIsGoingOn,
    #[msg("Winner already announced")]
    WinnerAlreadyAnnounced,
    #[msg("Invalid Admin Token Account")]
    InvalidAdminTokenAccount
}
