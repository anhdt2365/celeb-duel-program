import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import { CelebDuelProgram } from "../artifacts/celeb-duel-program";
import { TOKEN_PROGRAM_ID } from "spl-token";

export type VoteTwoParams = {
  accounts: {
    authority: PublicKey;
    mintAuthority: PublicKey;
    feePayer: PublicKey;
    duelConfigAccount: PublicKey;
    duelAccount: PublicKey;
    userAccount: PublicKey;
    duelTokenTwoAccount: PublicKey;
    tokenTwo: PublicKey;
  };
  inputs: {};
};

export async function voteTwo(
  program: Program<CelebDuelProgram>,
  params: VoteTwoParams,
): Promise<TransactionInstruction> {
  const { accounts } = params;

  const ix = await program.methods
    .voteTwo()
    .accounts({
      ...accounts,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .instruction();

  return ix;
}
