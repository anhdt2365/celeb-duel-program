pub const DISCRIMINATOR_LEN: usize = 8;
pub const PUBKEY_LEN: usize = 32;
pub const U64_LEN: usize = 8;
pub const U8_LEN: usize = 1;
pub const BOOL_LEN: usize = 1;
pub const SECONDS_PER_DAY: i64 = 24 * 60 * 60;
pub const SECONDS_PER_MINUTE: i64 = 60;

pub const DUEL_CONFIG_SEED: &[u8] = b"duel_config_account";
pub const DUEL_SEED: &[u8] = b"duel_account";
pub const DUEL_TOKEN_ONE_SEED: &[u8] = b"duel_token_one_account";
pub const DUEL_TOKEN_TWO_SEED: &[u8] = b"duel_token_two_account";
pub const USER_SEED: &[u8] = b"user_account";