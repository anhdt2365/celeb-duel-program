import { BN, BorshAccountsCoder, Idl } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { CelebDuelProgram } from "../artifacts/celeb-duel-program";
import * as IDL from "../artifacts/celeb-duel-program.json";

export type CelebDuelProgramType = CelebDuelProgram;
export const CelebDuelProgramIDL = IDL as Idl;
export const accountsCoder = new BorshAccountsCoder(CelebDuelProgramIDL);

export enum AccountName {
  DuelConfig = "duelConfig",
  Duel = "duel",
  User = "user",
}

export type DuelConfigData = {
  account: PublicKey;
  bump: number[];
  admin: PublicKey;
  latestDuelId: BN;
  testMode: boolean;
};

export type DuelData = {
  account: PublicKey;
  id: BN;
  duelConfigAccount: PublicKey;
  bump: number[];
  tokenOneBump: number[];
  tokenTwoBump: number[];
  tokenOne: PublicKey;
  tokenTwo: PublicKey;
  duelTokenOneAccount: PublicKey;
  duelTokenTwoAccount: PublicKey;
  totalVoteOne: BN;
  totalVoteTwo: BN;
  startDate: BN;
  endDate: BN;
  winner: number;
};

export type UserData = {
  account: PublicKey;
  bump: number[];
  duelAccount: PublicKey;
  initialized: boolean;
  user: PublicKey;
  totalVotedOne: BN;
  totalVotedTwo: BN;
  lastVoteTime: BN;
};

export enum DuelResult {
  OneWin = 1,
  TwoWin = 2,
  Tie = 3
}