import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, TransactionInstruction } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import { CelebDuelProgram } from "../artifacts/celeb-duel-program";

export type InitializeParams = {
  accounts: {
    authority: PublicKey;
    feePayer: PublicKey;
    duelConfigAccount: PublicKey;
  };
  inputs: {
    testMode: boolean
  };
};

export async function initialize(
  program: Program<CelebDuelProgram>,
  params: InitializeParams,
): Promise<TransactionInstruction> {
  const { accounts, inputs } = params;

  const ix = await program.methods
    .initialize(
      inputs.testMode,
    )
    .accounts({
      ...accounts,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .instruction();

  return ix;
}
