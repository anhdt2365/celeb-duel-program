import { PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import { TransactionBuilder } from "@orca-so/common-sdk";
import { Context, PDA, getVoteDay } from "..";
import { DuelConfigData, DuelData, DuelResult, UserData } from "../types";
import { getAccount } from "spl-token";

export class DuelClient {
  ctx: Context;
  public pda: PDA;
  public duelConfig: PublicKey;

  constructor(ctx: Context, pda: PDA, duelConfig: PublicKey) {
    this.ctx = ctx;
    this.pda = pda;
    this.duelConfig = duelConfig;
  }

  public static async getClient(
    ctx: Context,
    duelConfig: PublicKey = SystemProgram.programId,
  ): Promise<DuelClient> {
    const pda = new PDA(ctx.program.programId);
    return new DuelClient(ctx, pda, duelConfig);
  }

  public async buildInitializeIx(
    testMode: boolean,
    feePayer: PublicKey = this.ctx.wallet.publicKey,
  ): Promise<TransactionInstruction> {
    const duelConfig = this.pda.duel_config(this.ctx.wallet.publicKey);

    return await this.ctx.methods.initializeIx({
      accounts: {
        feePayer,
        authority: this.ctx.wallet.publicKey,
        duelConfigAccount: duelConfig.key,
      },
      inputs: {
        testMode,
      },
    });
  }

  public async initialize(testMode: boolean): Promise<TransactionBuilder> {
    const duelConfig = this.pda.duel_config(this.ctx.wallet.publicKey);

    const tx = (
      await this.ctx.methods.initialize({
        accounts: {
          feePayer: this.ctx.wallet.publicKey,
          authority: this.ctx.wallet.publicKey,
          duelConfigAccount: duelConfig.key,
        },
        inputs: {
          testMode,
        },
      })
    ).toTx();

    return tx;
  }

  public async changeMode(testMode: boolean): Promise<TransactionBuilder> {
    if (!this.duelConfig) {
      throw Error("Please add Duel Config into DuelClient");
    }
    const duelConfigData = await this.getDuelConfig(this.duelConfig);
    if (duelConfigData.testMode === testMode) {
      throw Error("Test mode not change");
    }
    if (duelConfigData.admin.toBase58() !== this.ctx.wallet.publicKey.toBase58()) {
      throw Error("Only Admin can change mode");
    }

    const tx = (
      await this.ctx.methods.changeMode({
        accounts: {
          authority: this.ctx.wallet.publicKey,
          duelConfigAccount: this.duelConfig,
        },
        inputs: {
          testMode,
        },
      })
    ).toTx();

    return tx;
  }

  public async buildCreateDuelIx(
    tokenOne: PublicKey,
    tokenTwo: PublicKey,
    startTime: string,
    endTime: string,
    feePayer: PublicKey = this.ctx.wallet.publicKey,
  ): Promise<TransactionInstruction> {
    if (!this.duelConfig) {
      throw Error("Please add Duel Config into DuelClient");
    }
    if (new BN(startTime).gt(new BN(endTime))) {
      throw Error("Start time is can not greater than End time");
    }
    const duelConfigData = await this.getDuelConfig(this.duelConfig);
    if (duelConfigData.admin.toBase58() !== this.ctx.wallet.publicKey.toBase58()) {
      throw Error("Only Admin can create duel");
    }

    const duelId = duelConfigData.latestDuelId.add(new BN(1));
    const duel = this.pda.duel(duelId);
    const duelTokenOne = this.pda.duel_token_one(duel.key);
    const duelTokenTwo = this.pda.duel_token_two(duel.key);

    return await this.ctx.methods.createDuelIx({
      accounts: {
        feePayer,
        authority: this.ctx.wallet.publicKey,
        duelConfigAccount: this.duelConfig,
        duelAccount: duel.key,
        duelTokenOneAccount: duelTokenOne.key,
        duelTokenTwoAccount: duelTokenTwo.key,
        tokenOne,
        tokenTwo,
      },
      inputs: {
        duelId,
        startDate: new BN(startTime),
        endDate: new BN(endTime),
      },
    });
  }

  public async createDuel(
    tokenOne: PublicKey,
    tokenTwo: PublicKey,
    startTime: string,
    endTime: string,
  ): Promise<TransactionBuilder> {
    if (!this.duelConfig) {
      throw Error("Please add Duel Config into DuelClient");
    }
    if (tokenOne.toBase58() === tokenTwo.toBase58()) {
      throw Error("Cannot create Duel of same tokens");
    }
    if (new BN(startTime).gt(new BN(endTime))) {
      throw Error("Start time is can not greater than End time");
    }
    const duelConfigData = await this.getDuelConfig(this.duelConfig);
    if (duelConfigData.admin.toBase58() !== this.ctx.wallet.publicKey.toBase58()) {
      throw Error("Only Admin can create duel");
    }

    const duelId = duelConfigData.latestDuelId.add(new BN(1));
    const duel = this.pda.duel(duelId);
    const duelTokenOne = this.pda.duel_token_one(duel.key);
    const duelTokenTwo = this.pda.duel_token_two(duel.key);

    const tx = (
      await this.ctx.methods.createDuel({
        accounts: {
          feePayer: this.ctx.wallet.publicKey,
          authority: this.ctx.wallet.publicKey,
          duelConfigAccount: this.duelConfig,
          duelAccount: duel.key,
          duelTokenOneAccount: duelTokenOne.key,
          duelTokenTwoAccount: duelTokenTwo.key,
          tokenOne,
          tokenTwo,
        },
        inputs: {
          duelId,
          startDate: new BN(startTime),
          endDate: new BN(endTime),
        },
      })
    ).toTx();

    return tx;
  }

  public async buildVoteOneIx(
    duelId: string,
    voter: PublicKey,
    feePayer: PublicKey = this.ctx.wallet.publicKey,
  ): Promise<TransactionInstruction> {
    if (!this.duelConfig) {
      throw Error("Please add Duel Config into DuelClient");
    }
    const duel = this.pda.duel(new BN(duelId));
    const duelData = await this.getOneDuel(duel.key);
    const user = this.pda.user(duelData.account, voter);

    return await this.ctx.methods.voteOneIx({
      accounts: {
        feePayer,
        authority: voter,
        duelConfigAccount: this.duelConfig,
        duelAccount: duel.key,
        userAccount: user.key,
        duelTokenOneAccount: duelData.duelTokenOneAccount,
        tokenOne: duelData.tokenOne,
      },
      inputs: {},
    });
  }

  public async voteOne(duelId: string): Promise<TransactionBuilder> {
    if (!this.duelConfig) {
      throw Error("Please add Duel Config into DuelClient");
    }
    const duel = this.pda.duel(new BN(duelId));
    const duelData = await this.getOneDuel(duel.key);
    const user = this.pda.user(duelData.account, this.ctx.wallet.publicKey);

    const tx = (
      await this.ctx.methods.voteOne({
        accounts: {
          feePayer: this.ctx.wallet.publicKey,
          authority: this.ctx.wallet.publicKey,
          duelConfigAccount: this.duelConfig,
          duelAccount: duel.key,
          userAccount: user.key,
          duelTokenOneAccount: duelData.duelTokenOneAccount,
          tokenOne: duelData.tokenOne,
        },
        inputs: {},
      })
    ).toTx();

    return tx;
  }

  public async buildVoteTwoIx(
    duelId: string,
    voter: PublicKey,
    feePayer: PublicKey = this.ctx.wallet.publicKey,
  ): Promise<TransactionInstruction> {
    const duel = this.pda.duel(new BN(duelId));
    const duelData = await this.getOneDuel(duel.key);
    const user = this.pda.user(duelData.account, voter);

    return await this.ctx.methods.voteTwoIx({
      accounts: {
        feePayer,
        authority: voter,
        duelConfigAccount: this.duelConfig,
        duelAccount: duel.key,
        userAccount: user.key,
        duelTokenTwoAccount: duelData.duelTokenTwoAccount,
        tokenTwo: duelData.tokenTwo,
      },
      inputs: {},
    });
  }

  public async voteTwo(duelId: string): Promise<TransactionBuilder> {
    const duel = this.pda.duel(new BN(duelId));
    const duelData = await this.getOneDuel(duel.key);
    const user = this.pda.user(duelData.account, this.ctx.wallet.publicKey);

    const tx = (
      await this.ctx.methods.voteTwo({
        accounts: {
          feePayer: this.ctx.wallet.publicKey,
          authority: this.ctx.wallet.publicKey,
          duelConfigAccount: this.duelConfig,
          duelAccount: duel.key,
          userAccount: user.key,
          duelTokenTwoAccount: duelData.duelTokenTwoAccount,
          tokenTwo: duelData.tokenTwo,
        },
        inputs: {},
      })
    ).toTx();

    return tx;
  }

  public async announceWinner(
    duelId: string,
    tokenAccount: PublicKey,
  ): Promise<TransactionBuilder | null> {
    const duel = this.pda.duel(new BN(duelId));
    const duelData = await this.getOneDuel(duel.key);
    const duelConfigData = await this.getDuelConfig(duelData.duelConfigAccount);

    const tokenAccountInfo = await getAccount(this.ctx.connection, tokenAccount);
    if (tokenAccountInfo.owner.toBase58() !== duelConfigData.admin.toBase58()) {
      throw Error("Token account it not belong to admin");
    }

    switch (await this.getDuelResult(duelId)) {
      case 1:
        if (tokenAccountInfo.mint != duelData.tokenOne) {
          throw Error("Invalid admin token account");
        }
        break;
      case 2:
        if (tokenAccountInfo.mint != duelData.tokenTwo) {
          throw Error("Invalid admin token account");
        }
        break;
      case 3:
        throw Error("Duel is tie");
      default:
        return null;
    }

    const tx = (
      await this.ctx.methods.announceWinner({
        accounts: {
          authority: this.ctx.wallet.publicKey,
          authorityTokenAccount: tokenAccount,
          duelConfigAccount: this.duelConfig,
          duelAccount: duel.key,
          duelTokenOneAccount: duelData.duelTokenOneAccount,
          duelTokenTwoAccount: duelData.duelTokenTwoAccount,
        },
        inputs: {},
      })
    ).toTx();

    return tx;
  }

  public async getDuelConfig(duelConfig: PublicKey): Promise<DuelConfigData> {
    const duelConfigData = await this.ctx.fetcher.getOneDuelConfig(duelConfig, true);
    if (!duelConfigData) {
      throw new Error(`Duel Config of ${duelConfig} not found`);
    }
    duelConfigData.account = duelConfig;
    return duelConfigData;
  }

  public async getDuelById(duelId: string): Promise<DuelData> {
    const pda = new PDA(this.ctx.program.programId);
    const duel = pda.duel(new BN(duelId));

    const duelData = await this.ctx.fetcher.getOneDuel(duel.key, true);
    if (!duelData) {
      throw new Error(`Duel of ${duelData} not found`);
    }
    duelData.account = duel.key;
    return duelData;
  }

  public async getOneDuel(duel: PublicKey): Promise<DuelData> {
    const duelData = await this.ctx.fetcher.getOneDuel(duel, true);
    if (!duelData) {
      throw new Error(`Duel ${duel} not found`);
    }
    duelData.account = duel;
    return duelData;
  }

  public async getUserByUserPublicKey(
    duel: PublicKey,
    userPublicKey: PublicKey,
  ): Promise<UserData | null> {
    const pda = new PDA(this.ctx.program.programId);
    const user = pda.user(duel, userPublicKey);

    return this.getOneUser(user.key);
  }

  public async getOneUser(user: PublicKey): Promise<UserData | null> {
    const userData = await this.ctx.fetcher.getOneUser(user, true);
    if (!userData) {
      console.log("User not found");
      return null;
    }
    userData.account = user;

    return userData;
  }

  public async getDuelResult(duelId: string): Promise<DuelResult> {
    const duel = this.pda.duel(new BN(duelId));
    const duelData = await this.getOneDuel(duel.key);
    const now = (new Date().getTime() / 1000).toFixed();
    if (duelData.endDate.toNumber() > Number(now)) {
      throw Error("Duel is going on");
    }
    if (duelData.totalVoteOne.gt(duelData.totalVoteTwo)) {
      return DuelResult.OneWin;
    } else if (duelData.totalVoteOne.lt(duelData.totalVoteTwo)) {
      return DuelResult.TwoWin;
    } else {
      return DuelResult.Tie;
    }
  }

  public async canVote(duelId: string, userPublicKey: PublicKey): Promise<boolean> {
    const duelConfig = await this.getDuelConfig(this.duelConfig);
    const duel = this.pda.duel(new BN(duelId));
    const duelData = await this.getOneDuel(duel.key);
    const now = (new Date().getTime() / 1000).toFixed();
    if (duelData.startDate.toNumber() > Number(now)) {
      console.log("Duel is not started");
      return false;
    }
    if (duelData.endDate.toNumber() < Number(now)) {
      console.log("Duel is ended");
      return false;
    }
    const user = this.pda.user(duel.key, userPublicKey);
    const userData = await this.getOneUser(user.key);
    if (!userData) return true;
    const lastVoteTime = getVoteDay(userData.lastVoteTime.toNumber(), duelConfig.testMode);
    const currentDay = getVoteDay(Number(now), duelConfig.testMode);
    return lastVoteTime != currentDay ? true : false;
  }
}
