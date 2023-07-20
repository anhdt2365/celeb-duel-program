import { Instruction } from "@orca-so/common-sdk";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import { CelebDuelProgram } from "../artifacts/celeb-duel-program";
import { TOKEN_PROGRAM_ID } from "spl-token";

export type AnnounceWinnerParams = {
  accounts: {
    authority: PublicKey;
    authorityTokenAccount: PublicKey;
    duelConfigAccount: PublicKey;
    duelAccount: PublicKey;
    duelTokenOneAccount: PublicKey;
    duelTokenTwoAccount: PublicKey;
  };
  inputs: {};
};

export async function announceWinner(
  program: Program<CelebDuelProgram>,
  params: AnnounceWinnerParams,
): Promise<Instruction> {
  const { accounts } = params;

  const ix = await program.methods
    .announceWinner()
    .accounts({
      ...accounts,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();

  return {
    instructions: [ix],
    cleanupInstructions: [],
    signers: [],
  };
}
