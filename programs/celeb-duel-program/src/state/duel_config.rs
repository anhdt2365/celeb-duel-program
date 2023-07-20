use crate::*;

#[account]
pub struct DuelConfig {
    pub bump: [u8; 1],
    pub admin: Pubkey,
    pub latest_duel_id: u64,
    pub test_mode: bool,
}

impl DuelConfig {
    pub const LEN: usize = DISCRIMINATOR_LEN +
        U8_LEN +            // bump
        PUBKEY_LEN +        // admin address
        U64_LEN +           // latest duel ID
        BOOL_LEN;           // test mode

    pub fn init(&mut self, bump: u8, admin: Pubkey, test_mode: bool) -> Result<()> {
        self.bump = [bump];
        self.admin = admin;
        self.latest_duel_id = 0;
        self.test_mode = test_mode;

        Ok(())
    }

    pub fn transfer_ownership(&mut self, new_admin: Pubkey) -> Result<()> {
        self.admin = new_admin;

        Ok(())
    }

    pub fn change_mode(&mut self, test_mode: bool) -> Result<()> {
        self.test_mode = test_mode;

        Ok(())
    }

    pub fn new_duel(&mut self) {
        self.latest_duel_id += 1;
    }
}
