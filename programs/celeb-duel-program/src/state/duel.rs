use crate::*;

#[account]
pub struct Duel {
    pub id: u64,
    pub duel_config_account: Pubkey,
    pub bump: [u8; 1],
    pub token_one_bump: [u8; 1],
    pub token_two_bump: [u8; 1],
    pub token_one: Pubkey,
    pub token_two: Pubkey,
    pub duel_token_one_account: Pubkey,
    pub duel_token_two_account: Pubkey,
    pub total_vote_one: u64,
    pub total_vote_two: u64,
    pub start_date: u64,
    pub end_date: u64,
    pub winner: u8,
}

impl Duel {
    pub const LEN: usize = DISCRIMINATOR_LEN +
        U64_LEN +           // id
        PUBKEY_LEN +        // duel config account
        U8_LEN +            // bump
        U8_LEN +            // token one bump
        U8_LEN +            // token two bump
        PUBKEY_LEN +        // token one
        PUBKEY_LEN +        // token two
        PUBKEY_LEN +        // duel token one account
        PUBKEY_LEN +        // duel token two account
        U64_LEN +           // total vote one
        U64_LEN +           // total vote two
        U64_LEN +           // start date
        U64_LEN +           // end date
        U8_LEN;             // winner: 1 as number one win, and so on

    pub fn init(
        &mut self,
        id: u64,
        duel_config: Pubkey,
        bump: u8,
        token_one_bump: u8,
        token_two_bump: u8,
        token_one: Pubkey,
        token_two: Pubkey,
        duel_token_one_account: Pubkey,
        duel_token_two_account: Pubkey,
        start_date: u64,
        end_date: u64,
    ) -> Result<()> {
        self.id = id;
        self.duel_config_account = duel_config;
        self.bump = [bump];
        self.token_one_bump = [token_one_bump];
        self.token_two_bump = [token_two_bump];
        self.token_one = token_one;
        self.token_two = token_two;
        self.duel_token_one_account = duel_token_one_account;
        self.duel_token_two_account = duel_token_two_account;
        self.total_vote_one = 0;
        self.total_vote_two = 0;
        self.start_date = start_date;
        self.end_date = end_date;
        self.winner = 0;

        Ok(())
    }

    pub fn vote_one(
        &mut self,
    ) {
        self.total_vote_one += 1;
    }

    pub fn vote_two(
        &mut self,
    ) {
        self.total_vote_two += 1;
    }
}