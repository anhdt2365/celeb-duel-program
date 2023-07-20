use crate::*;

#[account]
pub struct User {
    pub bump: [u8; 1],
    pub duel_account: Pubkey,
    pub initialized: bool,
    pub user: Pubkey,
    pub total_voted_one: u64,
    pub total_voted_two: u64,
    pub last_vote_time: u64,
}

impl User {
    pub const LEN: usize = DISCRIMINATOR_LEN +
        U8_LEN +            // bump
        PUBKEY_LEN +        // duel account
        BOOL_LEN +          // account initialized flag
        PUBKEY_LEN +        // user
        U64_LEN +           // total voted one
        U64_LEN +           // total voted two
        U64_LEN;            // last vote time

    pub fn initialize(&mut self, bump: u8, duel: Pubkey, user: Pubkey) {
        self.duel_account = duel;
        self.bump = [bump];
        self.initialized = true;
        self.user = user;
        self.total_voted_one = 0;
        self.total_voted_two = 0;
        self.last_vote_time = 0;
    }

    pub fn vote(&mut self, vote_one: bool, test_mode: bool) -> Result<()> {
        let now = Clock::get().unwrap().unix_timestamp;
        if self.last_vote_time != 0 {
            invariant!(
                Self::get_day(now, test_mode)
                    != Self::get_day(self.last_vote_time as i64, test_mode),
                CelebDuelErrorCode::OnlyOneVote
            );
        }

        if vote_one {
            msg!("Voted Number One");
            self.total_voted_one += 1;
        } else {
            msg!("Voted Number Two");
            self.total_voted_two += 1;
        }
        self.last_vote_time = now as u64;

        Ok(())
    }

    fn get_day(timestamp: i64, test_mode: bool) -> i64 {
        let days;
        if !test_mode {
            days = (timestamp / SECONDS_PER_DAY) % 31 + 1;
        } else {
            days = (timestamp / SECONDS_PER_MINUTE) % 60;
        }
        days
    }
}
