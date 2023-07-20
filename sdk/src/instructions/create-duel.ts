import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import { Program, BN } from "@project-serum/anchor";
import { CelebDuelProgram } from "../artifacts/celeb-duel-program";
import { TOKEN_PROGRAM_ID } from "spl-token";

export type CreateDuelParams = {
  accounts: {
    authority: PublicKey;
    feePayer: PublicKey;
    duelConfigAccount: PublicKey;
    duelAccount: PublicKey;
    duelTokenOneAccount: PublicKey;
    duelTokenTwoAccount: PublicKey;
    tokenOne: PublicKey;
    tokenTwo: PublicKey;
  };
  inputs: {
    duelId: BN;
    startDate: BN;
    endDate: BN;
  };
};

export async function createDuel(
  program: Program<CelebDuelProgram>,
  params: CreateDuelParams,
): Promise<TransactionInstruction> {
  const { accounts, inputs } = params;

  const ix = await program.methods
    .createDuel(inputs.duelId, inputs.startDate, inputs.endDate)
    .accounts({
      ...accounts,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .instruction();

  return ix;
}
