import { PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import { CelebDuelProgram } from "../artifacts/celeb-duel-program";

export type ChangeModeParams = {
  accounts: {
    authority: PublicKey;
    duelConfigAccount: PublicKey;
  };
  inputs: {
    testMode: boolean;
  };
};

export async function changeMode(
  program: Program<CelebDuelProgram>,
  params: ChangeModeParams,
): Promise<TransactionInstruction> {
  const { accounts, inputs } = params;

  const ix = await program.methods
    .changeMode(inputs.testMode)
    .accounts({
      ...accounts,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  return ix;
}
