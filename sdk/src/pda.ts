import * as anchor from "@project-serum/anchor";

export const DUEL_CONFIG_SEED = "duel_config_account";
export const DUEL_SEED = "duel_account";
export const DUEL_TOKEN_ONE_SEED = "duel_token_one_account";
export const DUEL_TOKEN_TWO_SEED = "duel_token_two_account";
export const USER_SEED = "user_account";

export interface PDAInfo {
  key: anchor.web3.PublicKey;
  bump: number;
}

export class PDA {
  readonly programId: anchor.web3.PublicKey;

  public constructor(programId: anchor.web3.PublicKey) {
    this.programId = programId;
  }

  duel_config = (admin: anchor.web3.PublicKey): PDAInfo => {
    const [pda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode(DUEL_CONFIG_SEED),
        (admin as anchor.web3.PublicKey).toBuffer(),
      ],
      this.programId,
    );
    return {
      key: pda,
      bump: bump,
    };
  };

  duel = (id: anchor.BN): PDAInfo => {
    const [pda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode(DUEL_SEED), id.toArrayLike(Buffer, "le", 8)],
      this.programId,
    );
    return {
      key: pda,
      bump: bump,
    };
  };

  duel_token_one = (duel: anchor.web3.PublicKey) => {
    const [pda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode(DUEL_TOKEN_ONE_SEED),
        (duel as anchor.web3.PublicKey).toBuffer(),
      ],
      this.programId,
    );
    return {
      key: pda,
      bump: bump,
    };
  };

  duel_token_two = (duel: anchor.web3.PublicKey) => {
    const [pda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode(DUEL_TOKEN_TWO_SEED),
        (duel as anchor.web3.PublicKey).toBuffer(),
      ],
      this.programId,
    );
    return {
      key: pda,
      bump: bump,
    };
  };

  user = (duel: anchor.web3.PublicKey, user: anchor.web3.PublicKey): PDAInfo => {
    const [pda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode(USER_SEED),
        (duel as anchor.web3.PublicKey).toBuffer(),
        (user as anchor.web3.PublicKey).toBuffer(),
      ],
      this.programId,
    );
    return {
      key: pda,
      bump: bump,
    };
  };
}
