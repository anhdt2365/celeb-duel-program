import * as anchor from "@project-serum/anchor";
import { SECONDS_PER_DAY, SECONDS_PER_MINUTE } from "../constants";

export function keypairFromJson(secretKey: number[]): anchor.web3.Keypair {
  return anchor.web3.Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

export function getVoteDay(timestamp: number, testMode: boolean): number {
  let days;
  if (!testMode) {
      days = (timestamp / SECONDS_PER_DAY) % 31 + 1;
  } else {
      days = (timestamp / SECONDS_PER_MINUTE) % 60;
  }
  return days;
}