import * as anchor from "@project-serum/anchor";
import { BN, Program, Wallet } from "@project-serum/anchor";
import { CelebDuelProgram } from "../target/types/celeb_duel_program";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Connection,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  Signer,
  SYSVAR_RENT_PUBKEY,
  SendTransactionError,
} from "@solana/web3.js";
import { createMint, createAssociatedTokenAccount, getAccount, AuthorityType, setAuthority, getMint } from "spl-token";
import { expect } from "chai";
import { Context, DuelClient } from "../sdk/src";
import * as bs58 from "bs58";
import base64 from "base-64";
require("dotenv").config();

const DUEL_CONFIG_SEED = "duel_config_account";
const DUEL_SEED = "duel_account";
const DUEL_TOKEN_ONE_SEED = "duel_token_one_account";
const DUEL_TOKEN_TWO_SEED = "duel_token_two_account";
const USER_SEED = "user_account";

const transferSol = async (connection: Connection, from: Signer, to: PublicKey, amount: number) => {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to,
      lamports: LAMPORTS_PER_SOL * amount,
    }),
  );
  await sendAndConfirmTransaction(connection, tx, [from]);
};

describe("celeb-duel-program-sdk", () => {
  const testProvider = anchor.AnchorProvider.env();
  const payerKeypair = anchor.web3.Keypair.fromSecretKey(bs58.decode(process.env.PRIV_KEY));
  const payer = new Wallet(payerKeypair);
  const payerAccount = payer.publicKey;
  let connection = testProvider.connection;
  let provider = new anchor.AnchorProvider(connection, payer, { commitment: "confirmed" });
  const program = anchor.workspace.CelebDuelProgram as Program<CelebDuelProgram>;

  let adminContext = Context.withProvider(provider, new PublicKey(program.programId));
  let client: DuelClient;

  let tokenOne: PublicKey;
  let tokenTwo: PublicKey;
  let payerTokenOneAccount: PublicKey;
  let payerTokenTwoAccount: PublicKey;
  let duelAccount: PublicKey;
  let duelTokenOneAccount: PublicKey;
  let duelTokenTwoAccount: PublicKey;
  let alice: Keypair = anchor.web3.Keypair.generate();
  let aliceWallet = new Wallet(alice);
  let aliceTokenOneAccount: PublicKey;
  let aliceTokenTwoAccount: PublicKey;
  let bob: Keypair = anchor.web3.Keypair.generate();
  let bobWallet = new Wallet(bob);
  let bobTokenOneAccount: PublicKey;
  let bobTokenTwoAccount: PublicKey;

  let aliceProvider = new anchor.AnchorProvider(connection, aliceWallet, {
    commitment: "confirmed",
  });
  let aliceContext = Context.withProvider(aliceProvider, new PublicKey(program.programId));
  let bobProvider = new anchor.AnchorProvider(connection, bobWallet, { commitment: "confirmed" });
  let bobContext = Context.withProvider(bobProvider, new PublicKey(program.programId));

  // Duel Variables
  let duelConfigAccount;
  let startTime;
  let endTime;
  let duelId;
  let userAccount;

  it("Is init resources", async () => {
    // Create mint
    tokenOne = await createMint(connection, payerKeypair, payer.publicKey, payer.publicKey, 9);
    tokenTwo = await createMint(connection, payerKeypair, payer.publicKey, payer.publicKey, 9);

    payerTokenOneAccount = await createAssociatedTokenAccount(
      provider.connection,
      payerKeypair,
      tokenOne,
      payerAccount,
    );
    payerTokenTwoAccount = await createAssociatedTokenAccount(
      provider.connection,
      payerKeypair,
      tokenTwo,
      payerAccount,
    );

    // Transfer 10 SOL to Alice and Bob
    await transferSol(connection, payerKeypair, alice.publicKey, 10);
    await transferSol(connection, payerKeypair, bob.publicKey, 10);
  });

  it("initialize", async () => {
    client = await DuelClient.getClient(adminContext);
    let bump;
    [duelConfigAccount, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(DUEL_CONFIG_SEED), payerAccount.toBuffer()],
      program.programId,
    );

    const tx = await client.initialize(true);
    await tx.buildAndExecute();

    const duelConfigAccountInfo = await client.getDuelConfig(duelConfigAccount);
    expect(duelConfigAccountInfo.account.toString()).to.be.equal(duelConfigAccount.toBase58());
    expect(duelConfigAccountInfo.bump[0]).to.be.equal(bump);
    expect(duelConfigAccountInfo.admin.toString()).to.be.equal(payerAccount.toBase58());
    expect(duelConfigAccountInfo.latestDuelId.toString()).to.be.equal("0");

    client = await DuelClient.getClient(adminContext, duelConfigAccount);
  });

  it("cannot create duel with invalid timestamp", async () => {
    startTime = (new Date().getTime() / 1000).toFixed().toString();
    endTime = (new Date().getTime() / 1000 - 1000).toFixed().toString();
    try {
      await client.createDuel(tokenOne, tokenTwo, startTime, endTime);
    } catch (err) {
      expect(err.message).to.be.equal("Start time is can not greater than End time");
    }
  });

  it("cannot create duel without admin role", async () => {
    startTime = (new Date().getTime() / 1000 - 10).toFixed().toString();
    endTime = (new Date().getTime() / 1000 + 1000).toFixed().toString();

    client = await DuelClient.getClient(aliceContext, duelConfigAccount);
    try {
      await client.createDuel(tokenOne, tokenTwo, startTime, endTime);
    } catch (err) {
      expect(err.message).to.be.equal("Only Admin can create duel");
    }
  });

  it("cannot create duel with same token", async () => {
    client = await DuelClient.getClient(adminContext, duelConfigAccount);
    try {
      await client.createDuel(tokenOne, tokenOne, startTime, endTime);
    } catch (err) {
      expect(err.message).to.be.equal("Cannot create Duel of same tokens");
    }
  });

  it("successful create duel", async () => {
    let duelConfigAccountInfo = await client.getDuelConfig(duelConfigAccount);
    duelId = new BN(duelConfigAccountInfo.latestDuelId).add(new BN(1));
    [duelAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(DUEL_SEED), duelId.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );
    [duelTokenOneAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(DUEL_TOKEN_ONE_SEED), duelAccount.toBuffer()],
      program.programId,
    );
    [duelTokenTwoAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(DUEL_TOKEN_TWO_SEED), duelAccount.toBuffer()],
      program.programId,
    );

    client = await DuelClient.getClient(adminContext, duelConfigAccount);
    const instructions = [
      await client.buildCreateDuelIx(
        tokenOne,
        tokenTwo,
        startTime,
        endTime,
        // bob.publicKey
      ),
    ];
    const transaction = new Transaction().add(...instructions);
    transaction.recentBlockhash = (await connection.getLatestBlockhash("processed")).blockhash;
    transaction.feePayer = payerAccount;
    const recoverTx = Transaction.from(transaction.serialize({ requireAllSignatures: false }));

    // transaction sign
    recoverTx.sign(payerKeypair);
    // recoverTx.partialSign(bob);

    await connection.sendRawTransaction(recoverTx.serialize());

    // Ensure tx above is confirmed
    await transferSol(connection, payerKeypair, Keypair.generate().publicKey, 1);

    let duelInfo1 = await program.account.duel.fetch(duelAccount);
    expect(duelInfo1.id.toString()).to.be.equal(duelId.toString());
    expect(duelInfo1.duelConfigAccount.toString()).to.be.equal(duelConfigAccount.toBase58());
    expect(duelInfo1.tokenOne.toString()).to.be.equal(tokenOne.toBase58());
    expect(duelInfo1.tokenTwo.toString()).to.be.equal(tokenTwo.toBase58());
    expect(duelInfo1.totalVoteOne.toString()).to.be.equal("0");
    expect(duelInfo1.totalVoteTwo.toString()).to.be.equal("0");
    expect(duelInfo1.startDate.toString()).to.be.equal(startTime);
    expect(duelInfo1.endDate.toString()).to.be.equal(endTime);
    expect(duelInfo1.winner).to.be.equal(0);

    let duelInfo = await client.getOneDuel(duelAccount);
    expect(duelInfo.id.toString()).to.be.equal(duelId.toString());
    expect(duelInfo.duelConfigAccount.toString()).to.be.equal(duelConfigAccount.toBase58());
    expect(duelInfo.tokenOne.toString()).to.be.equal(tokenOne.toBase58());
    expect(duelInfo.tokenTwo.toString()).to.be.equal(tokenTwo.toBase58());
    expect(duelInfo.duelTokenOneAccount.toString()).to.be.equal(duelTokenOneAccount.toBase58());
    expect(duelInfo.duelTokenTwoAccount.toString()).to.be.equal(duelTokenTwoAccount.toBase58());
    expect(duelInfo.totalVoteOne.toString()).to.be.equal("0");
    expect(duelInfo.totalVoteTwo.toString()).to.be.equal("0");
    expect(duelInfo.startDate.toString()).to.be.equal(startTime);
    expect(duelInfo.endDate.toString()).to.be.equal(endTime);
    expect(duelInfo.winner).to.be.equal(0);


    await setAuthority(
      connection,
      payerKeypair,
      tokenOne,
      payerAccount,
      AuthorityType.MintTokens,
      duelAccount
    );
    await setAuthority(
      connection,
      payerKeypair,
      tokenTwo,
      payerAccount,
      AuthorityType.MintTokens,
      duelAccount
    );

    const tokenOneInfo = await getMint(connection, tokenOne);
    expect(tokenOneInfo.mintAuthority.toBase58() === duelAccount.toBase58()).to.be.equal(true);
    const tokenTwoInfo = await getMint(connection, tokenTwo);
    expect(tokenTwoInfo.mintAuthority.toBase58() === duelAccount.toBase58()).to.be.equal(true);
  });

  it("successful vote number one", async () => {
    let duelTokenOneAccountInfo = await getAccount(connection, duelTokenOneAccount);
    expect(duelTokenOneAccountInfo.amount.toString()).to.be.equal("0");

    client = await DuelClient.getClient(adminContext, duelConfigAccount);

    const instructions = [await client.buildVoteOneIx(duelId, alice.publicKey, bob.publicKey)];
    const transaction = new Transaction().add(...instructions);
    transaction.recentBlockhash = (await connection.getLatestBlockhash("processed")).blockhash;
    transaction.feePayer = bob.publicKey;

    const recoverTx = Transaction.from(transaction.serialize({ requireAllSignatures: false }));

    recoverTx.partialSign(bob);
    let signedTx = await aliceWallet.signTransaction(recoverTx);
    await connection.sendRawTransaction(signedTx.serialize());

    // ensure tx above to be confirmed
    await transferSol(connection, payerKeypair, Keypair.generate().publicKey, 1);

    let userInfo = await client.getUserByUserPublicKey(duelAccount, alice.publicKey);
    expect(userInfo.duelAccount.toString()).to.be.equal(duelAccount.toBase58());
    expect(userInfo.initialized).to.be.equal(true);
    expect(userInfo.user.toString()).to.be.equal(alice.publicKey.toBase58());
    expect(userInfo.totalVotedOne.toString()).to.be.equal("1");
    expect(userInfo.totalVotedTwo.toString()).to.be.equal("0");
    expect(userInfo.lastVoteTime.toNumber()).to.greaterThan(Number(startTime));
    expect(userInfo.lastVoteTime.toNumber()).to.lessThan(Number(endTime));

    let duelInfo = await client.getOneDuel(duelAccount);
    expect(duelInfo.id.toString()).to.be.equal(duelId.toString());
    expect(duelInfo.duelConfigAccount.toString()).to.be.equal(duelConfigAccount.toBase58());
    expect(duelInfo.tokenOne.toString()).to.be.equal(tokenOne.toBase58());
    expect(duelInfo.tokenTwo.toString()).to.be.equal(tokenTwo.toBase58());
    expect(duelInfo.totalVoteOne.toString()).to.be.equal("1");
    expect(duelInfo.totalVoteTwo.toString()).to.be.equal("0");
    expect(duelInfo.startDate.toString()).to.be.equal(startTime);
    expect(duelInfo.endDate.toString()).to.be.equal(endTime);
    expect(duelInfo.winner).to.be.equal(0);

    duelTokenOneAccountInfo = await getAccount(connection, duelTokenOneAccount);
    expect(duelTokenOneAccountInfo.amount.toString()).to.be.equal(
      new BN(10 * LAMPORTS_PER_SOL).toString(),
    );

    // get voted user account
  });

  it("successful vote number two", async () => {
    let duelTokenTwoAccountInfo = await getAccount(connection, duelTokenTwoAccount);
    expect(duelTokenTwoAccountInfo.amount.toString()).to.be.equal("0");

    client = await DuelClient.getClient(adminContext, duelConfigAccount);

    let instructions = [await client.buildVoteTwoIx(duelId, bob.publicKey, alice.publicKey)];
    const transaction = new Transaction().add(...instructions);
    transaction.recentBlockhash = (await connection.getLatestBlockhash("processed")).blockhash;
    transaction.feePayer = alice.publicKey;

    const recoverTx = Transaction.from(transaction.serialize({ requireAllSignatures: false }));

    recoverTx.partialSign(alice);
    let signedTx = await bobWallet.signTransaction(recoverTx);
    await connection.sendRawTransaction(signedTx.serialize());

    // ensure tx above to be confirmed
    await transferSol(connection, payerKeypair, Keypair.generate().publicKey, 1);

    let userInfo = await client.getUserByUserPublicKey(duelAccount, bob.publicKey);
    expect(userInfo.duelAccount.toString()).to.be.equal(duelAccount.toBase58());
    expect(userInfo.initialized).to.be.equal(true);
    expect(userInfo.user.toString()).to.be.equal(bob.publicKey.toBase58());
    expect(userInfo.totalVotedOne.toString()).to.be.equal("0");
    expect(userInfo.totalVotedTwo.toString()).to.be.equal("1");
    expect(userInfo.lastVoteTime.toNumber()).to.greaterThan(Number(startTime));
    expect(userInfo.lastVoteTime.toNumber()).to.lessThan(Number(endTime));

    let duelInfo = await program.account.duel.fetch(duelAccount);
    expect(duelInfo.id.toString()).to.be.equal(duelId.toString());
    expect(duelInfo.duelConfigAccount.toString()).to.be.equal(duelConfigAccount.toBase58());
    expect(duelInfo.tokenOne.toString()).to.be.equal(tokenOne.toBase58());
    expect(duelInfo.tokenTwo.toString()).to.be.equal(tokenTwo.toBase58());
    expect(duelInfo.totalVoteOne.toString()).to.be.equal("1");
    expect(duelInfo.totalVoteTwo.toString()).to.be.equal("1");
    expect(duelInfo.startDate.toString()).to.be.equal(startTime);
    expect(duelInfo.endDate.toString()).to.be.equal(endTime);
    expect(duelInfo.winner).to.be.equal(0);

    duelTokenTwoAccountInfo = await getAccount(connection, duelTokenTwoAccount);
    expect(duelTokenTwoAccountInfo.amount.toString()).to.be.equal(
      new BN(10 * LAMPORTS_PER_SOL).toString(),
    );
  });

  it("cannot announce winner when duel not end", async () => {
    client = await DuelClient.getClient(adminContext, duelConfigAccount);
    try {
      await client.announceWinner(duelId, payerTokenOneAccount);
    } catch (err) {
      expect(err.message).to.be.equal("Duel is going on");
    }
  });
});
