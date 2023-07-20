import { TransactionBuilder, Instruction } from "@orca-so/common-sdk";
import { Context } from "./context";
import * as ixs from "./instructions";

export class Methods {
  public ctx: Context;
  public ix: Instruction | null | undefined;

  public constructor(ctx: Context, ix?: Instruction) {
    this.ctx = ctx;
    this.ix = ix;
  }

  public async initializeIx(params: ixs.InitializeParams) {
    return await ixs.initialize(this.ctx.program, params);
  }

  public async initialize(params: ixs.InitializeParams) {
    this.ix = {
      instructions: [await ixs.initialize(this.ctx.program, params)],
      cleanupInstructions: [],
      signers: [],
    };
    return this;
  }

  public async createDuelIx(params: ixs.CreateDuelParams) {
    return await ixs.createDuel(this.ctx.program, params);
  }

  public async createDuel(params: ixs.CreateDuelParams) {
    this.ix = {
      instructions: [await ixs.createDuel(this.ctx.program, params)],
      cleanupInstructions: [],
      signers: [],
    };
    return this;
  }

  public async voteOneIx(params: ixs.VoteOneParams) {
    return await ixs.voteOne(this.ctx.program, params);
  }

  public async voteOne(params: ixs.VoteOneParams) {
    this.ix = {
      instructions: [await ixs.voteOne(this.ctx.program, params)],
      cleanupInstructions: [],
      signers: [],
    };
    return this;
  }

  public async voteTwoIx(params: ixs.VoteTwoParams) {
    return await ixs.voteTwo(this.ctx.program, params);
  }

  public async voteTwo(params: ixs.VoteTwoParams) {
    this.ix = {
      instructions: [await ixs.voteTwo(this.ctx.program, params)],
      cleanupInstructions: [],
      signers: [],
    };
    return this;
  }

  public async announceWinner(params: ixs.AnnounceWinnerParams) {
    this.ix = await ixs.announceWinner(this.ctx.program, params);
    return this;
  }

  public async changeModeIx(params: ixs.ChangeModeParams) {
    return await ixs.changeMode(this.ctx.program, params);
  }

  public async changeMode(params: ixs.ChangeModeParams) {
    this.ix = {
      instructions: [await ixs.changeMode(this.ctx.program, params)],
      cleanupInstructions: [],
      signers: [],
    };
    return this;
  }

  public toTx(): TransactionBuilder {
    const tx = new TransactionBuilder(this.ctx.provider.connection, this.ctx.provider.wallet);
    return this.ix ? tx.addInstruction(this.ix) : tx;
  }
}
