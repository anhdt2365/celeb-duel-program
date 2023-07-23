import * as anchor from "@project-serum/anchor";
import { SECONDS_PER_DAY, SECONDS_PER_MINUTE } from "../constants";

export function keypairFromJson(secretKey: number[]): anchor.web3.Keypair {
  return anchor.web3.Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

export function getTimeCanVote(timestamp: number, testMode: boolean): number {
  let timestampCanVote;
  if (!testMode) {
    timestampCanVote = timestamp + SECONDS_PER_DAY;
  } else {
    timestampCanVote = timestamp + SECONDS_PER_MINUTE;
  }
  return Number(timestampCanVote);
}