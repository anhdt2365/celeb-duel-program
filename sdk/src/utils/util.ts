import * as anchor from "@project-serum/anchor";

export function keypairFromJson(secretKey: number[]): anchor.web3.Keypair {
  return anchor.web3.Keypair.fromSecretKey(Uint8Array.from(secretKey));
}
