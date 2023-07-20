import * as anchor from "@project-serum/anchor";
import { AnchorError, Program, BN } from "@project-serum/anchor";
import {
  createMint,
  createAssociatedTokenAccount,
  getAccount
} from "spl-token";
import {
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  Keypair,
  Signer,
  Connection,
  SYSVAR_RENT_PUBKEY,
  SendTransactionError,
} from "@solana/web3.js";
import { CelebDuelProgram } from "../target/types/celeb_duel_program";
import { TOKEN_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import { expect } from "chai";

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
    })
  );
  await sendAndConfirmTransaction(connection, tx, [from]);
}

describe("celeb-duel-program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = provider.connection;
  const program = anchor.workspace.CelebDuelProgram as Program<CelebDuelProgram>;
  const payer = (provider.wallet as any).payer;
  const payerAccount = payer.publicKey;

  let tokenOne: PublicKey;
  let tokenTwo: PublicKey;
  let payerTokenOneAccount: PublicKey;
  let payerTokenTwoAccount: PublicKey;
  let duelAccount: PublicKey;
  let duelTokenOneAccount: PublicKey;
  let duelTokenTwoAccount: PublicKey;
  let alice: Keypair = anchor.web3.Keypair.generate();
  let aliceTokenOneAccount: PublicKey;
  let aliceTokenTwoAccount: PublicKey;
  let bob: Keypair = anchor.web3.Keypair.generate();
  let bobTokenOneAccount: PublicKey;
  let bobTokenTwoAccount: PublicKey;

  // Duel Variables
  let duelConfigAccount;
  let startTime;
  let endTime;
  let duelId;

  // Vote Variables
  let userAccount;

  it("Is init resources", async () => {
    // Create mint
    tokenOne = await createMint(
      connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      9
    );
    tokenTwo = await createMint(
      connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      9
    );

    payerTokenOneAccount = await createAssociatedTokenAccount(
      provider.connection,
      payer,
      tokenOne,
      payerAccount
    );
    payerTokenTwoAccount = await createAssociatedTokenAccount(
      provider.connection,
      payer,
      tokenTwo,
      payerAccount
    );

    // Transfer 2 SOL to Alice and Bob
    await transferSol(connection, payer, alice.publicKey, 2);
    await transferSol(connection, payer, bob.publicKey, 2);
  });

  it("Is initialized!", async () => {
    let bump;
    [duelConfigAccount, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(DUEL_CONFIG_SEED), payerAccount.toBuffer()],
      program.programId
    );

    const instructions = [await program.methods.initialize(
      true // test mode
    ).accounts({
      authority: payerAccount,
      feePayer: payerAccount,
      duelConfigAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY
    }).instruction()];
    const transaction = new Transaction().add(...instructions);
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash("processed")
    ).blockhash;
    transaction.feePayer = payerAccount;
    const recoverTx = Transaction.from(
      transaction.serialize({ requireAllSignatures: false })
    );

    // transaction sign
    recoverTx.sign(payer);

    await connection.sendRawTransaction(recoverTx.serialize());

    // Ensure tx above is confirmed
    await transferSol(connection, payer, Keypair.generate().publicKey, 1);

    const duelConfigAccountInfo = await program.account.duelConfig.fetch(duelConfigAccount);
    expect(duelConfigAccountInfo.bump[0]).to.be.equal(bump);
    expect(duelConfigAccountInfo.admin.toString()).to.be.equal(payerAccount.toBase58());
    expect(duelConfigAccountInfo.latestDuelId.toString()).to.be.equal("0");
    expect(duelConfigAccountInfo.testMode).to.be.equal(true);
  });

  it("cannot change test mode with data remains unchanged", async () => {
    try {
      const instructions = [await program.methods.changeMode(
        true // test mode
      ).accounts({
        authority: payerAccount,
        duelConfigAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).instruction()];
      const transaction = new Transaction().add(...instructions);
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash("processed")
      ).blockhash;
      transaction.feePayer = payerAccount;
      const recoverTx = Transaction.from(
        transaction.serialize({ requireAllSignatures: false })
      );

      // transaction sign
      recoverTx.sign(payer);

      await connection.sendRawTransaction(recoverTx.serialize());
    } catch (err) {
      expect(err).to.be.instanceOf(SendTransactionError);
      expect((err as SendTransactionError).message).to.equal("failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x1772");
    }
  });

  it("cannot change test mode without admin role", async () => {
    try {
      const instructions = [await program.methods.changeMode(
        true // test mode
      ).accounts({
        authority: alice.publicKey,
        duelConfigAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).instruction()];
      const transaction = new Transaction().add(...instructions);
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash("processed")
      ).blockhash;
      transaction.feePayer = alice.publicKey;
      const recoverTx = Transaction.from(
        transaction.serialize({ requireAllSignatures: false })
      );

      // transaction sign
      recoverTx.sign(alice);

      await connection.sendRawTransaction(recoverTx.serialize());
    } catch (err) {
      expect(err).to.be.instanceOf(SendTransactionError);
      expect((err as SendTransactionError).message).to.equal("failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x1770");
    }
  });

  it("successful change test mode", async () => {
    const instructions1 = [await program.methods.changeMode(
      false // test mode
    ).accounts({
      authority: payerAccount,
      duelConfigAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).instruction()];
    const transaction1 = new Transaction().add(...instructions1);
    transaction1.recentBlockhash = (
      await connection.getLatestBlockhash("processed")
    ).blockhash;
    transaction1.feePayer = payerAccount;
    const recoverTx1 = Transaction.from(
      transaction1.serialize({ requireAllSignatures: false })
    );

    // transaction sign
    recoverTx1.sign(payer);

    await connection.sendRawTransaction(recoverTx1.serialize());

    // Ensure tx above is confirmed
    await transferSol(connection, payer, Keypair.generate().publicKey, 1);

    let duelConfigAccountInfo = await program.account.duelConfig.fetch(duelConfigAccount);
    expect(duelConfigAccountInfo.testMode).to.be.equal(false);

    const instructions2 = [await program.methods.changeMode(
      true // test mode
    ).accounts({
      authority: payerAccount,
      duelConfigAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).instruction()];
    const transaction2 = new Transaction().add(...instructions2);
    transaction2.recentBlockhash = (
      await connection.getLatestBlockhash("processed")
    ).blockhash;
    transaction2.feePayer = payerAccount;
    const recoverTx2 = Transaction.from(
      transaction2.serialize({ requireAllSignatures: false })
    );

    // transaction sign
    recoverTx2.sign(payer);

    await connection.sendRawTransaction(recoverTx2.serialize());

    // Ensure tx above is confirmed
    await transferSol(connection, payer, Keypair.generate().publicKey, 1);

    duelConfigAccountInfo = await program.account.duelConfig.fetch(duelConfigAccount);
    expect(duelConfigAccountInfo.testMode).to.be.equal(true);
  });

  it("cannot create duel with invalid timestamp", async () => {
    let duelConfigAccountInfo = await program.account.duelConfig.fetch(duelConfigAccount);
    duelId = new BN(duelConfigAccountInfo.latestDuelId).add(new BN(1));
    [duelAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(DUEL_SEED), duelId.toArrayLike(Buffer, 'le', 8)],
      program.programId
    );
    [duelTokenOneAccount,] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(DUEL_TOKEN_ONE_SEED), duelAccount.toBuffer()],
      program.programId
    );
    [duelTokenTwoAccount,] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(DUEL_TOKEN_TWO_SEED), duelAccount.toBuffer()],
      program.programId
    );

    startTime = (new Date().getTime() / 1000).toFixed().toString();
    endTime = ((new Date().getTime() / 1000) - 1000).toFixed().toString();
    try {
      const instructions = [await program.methods.createDuel(
        duelId,
        new BN(startTime),
        new BN(endTime),
      ).accounts({
        authority: payerAccount,
        feePayer: payerAccount,
        duelConfigAccount,
        duelAccount,
        duelTokenOneAccount,
        duelTokenTwoAccount,
        tokenOne,
        tokenTwo,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      }).instruction()];
      const transaction = new Transaction().add(...instructions);
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash("processed")
      ).blockhash;
      transaction.feePayer = payerAccount;
      const recoverTx = Transaction.from(
        transaction.serialize({ requireAllSignatures: false })
      );

      // transaction sign
      recoverTx.sign(payer);

      await connection.sendRawTransaction(recoverTx.serialize());
    } catch (err) {
      expect(err).to.be.instanceOf(SendTransactionError);
      expect((err as SendTransactionError).message).to.equal("failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x177a");
    }
  });

  it("cannot create duel without admin role", async () => {
    startTime = (new Date().getTime() / 1000).toFixed().toString();
    endTime = ((new Date().getTime() / 1000) + 1000).toFixed().toString();
    try {
      const instructions = [await program.methods.createDuel(
        duelId,
        new BN(startTime),
        new BN(endTime),
      ).accounts({
        authority: alice.publicKey,
        feePayer: alice.publicKey,
        duelConfigAccount,
        duelAccount,
        duelTokenOneAccount,
        duelTokenTwoAccount,
        tokenOne,
        tokenTwo,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      }).instruction()];
      const transaction = new Transaction().add(...instructions);
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash("processed")
      ).blockhash;
      transaction.feePayer = alice.publicKey;
      const recoverTx = Transaction.from(
        transaction.serialize({ requireAllSignatures: false })
      );

      // transaction sign
      recoverTx.sign(alice);

      await connection.sendRawTransaction(recoverTx.serialize());
    } catch (err) {
      expect(err).to.be.instanceOf(SendTransactionError);
      expect((err as SendTransactionError).message).to.equal("failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x1770");
    }
  });

  it("cannot create duel with same tokens", async () => {
    try {
      const instructions = [await program.methods.createDuel(
        duelId,
        new BN(startTime),
        new BN(endTime),
      ).accounts({
        authority: payerAccount,
        feePayer: payerAccount,
        duelConfigAccount,
        duelAccount,
        duelTokenOneAccount,
        duelTokenTwoAccount,
        tokenOne,
        tokenTwo: tokenOne,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      }).instruction()];
      const transaction = new Transaction().add(...instructions);
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash("processed")
      ).blockhash;
      transaction.feePayer = payerAccount;
      const recoverTx = Transaction.from(
        transaction.serialize({ requireAllSignatures: false })
      );

      // transaction sign
      recoverTx.sign(payer);

      await connection.sendRawTransaction(recoverTx.serialize());
    } catch (err) {
      expect(err).to.be.instanceOf(SendTransactionError);
      expect((err as SendTransactionError).message).to.equal("failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x1773");
    }
  });

  it("successful create duel", async () => {
    startTime = ((new Date().getTime() / 1000) - 10).toFixed().toString();
    endTime = ((new Date().getTime() / 1000) + 1000).toFixed().toString();
    const instructions = [await program.methods.createDuel(
      duelId,
      new BN(startTime),
      new BN(endTime),
    ).accounts({
      authority: payerAccount,
      feePayer: payerAccount,
      duelConfigAccount,
      duelAccount,
      duelTokenOneAccount,
      duelTokenTwoAccount,
      tokenOne,
      tokenTwo,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    }).instruction()];
    const transaction = new Transaction().add(...instructions);
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash("processed")
    ).blockhash;
    transaction.feePayer = payerAccount;
    const recoverTx = Transaction.from(
      transaction.serialize({ requireAllSignatures: false })
    );

    // transaction sign
    recoverTx.sign(payer);

    await connection.sendRawTransaction(recoverTx.serialize());

    // Ensure tx above is confirmed
    await transferSol(connection, payer, Keypair.generate().publicKey, 1);

    let duelInfo = await program.account.duel.fetch(duelAccount);
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
  });

  it("cannot vote wrong mint", async () => {
    [userAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(USER_SEED), duelAccount.toBuffer(), alice.publicKey.toBuffer()],
      program.programId
    );

    try {
      const instructions = [await program.methods.voteOne().accounts({
        authority: alice.publicKey,
        feePayer: payerAccount,
        mintAuthority: payerAccount,
        duelConfigAccount,
        duelAccount,
        userAccount,
        duelTokenOneAccount,
        tokenOne: tokenTwo,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      }).instruction()];
      const transaction = new Transaction().add(...instructions);
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash("processed")
      ).blockhash;
      transaction.feePayer = alice.publicKey;
      const recoverTx = Transaction.from(
        transaction.serialize({ requireAllSignatures: false })
      );

      // transaction sign
      recoverTx.partialSign(alice);
      recoverTx.partialSign(payer);

      await connection.sendRawTransaction(recoverTx.serialize());
    } catch (err) {
      expect(err).to.be.instanceOf(SendTransactionError);
      expect((err as SendTransactionError).message).to.equal("failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x1776");
    }

    try {
      const instructions = [await program.methods.voteTwo().accounts({
        authority: alice.publicKey,
        feePayer: payerAccount,
        mintAuthority: payerAccount,
        duelConfigAccount,
        duelAccount,
        userAccount,
        duelTokenTwoAccount,
        tokenTwo: tokenOne,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      }).instruction()];
      const transaction = new Transaction().add(...instructions);
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash("processed")
      ).blockhash;
      transaction.feePayer = alice.publicKey;
      const recoverTx = Transaction.from(
        transaction.serialize({ requireAllSignatures: false })
      );

      // transaction sign
      recoverTx.partialSign(alice);
      recoverTx.partialSign(payer);

      await connection.sendRawTransaction(recoverTx.serialize());
    } catch (err) {
      expect(err).to.be.instanceOf(SendTransactionError);
      expect((err as SendTransactionError).message).to.equal("failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x1776");
    }
  });

  it("successful vote number one", async () => {
    let duelTokenOneAccountInfo = await getAccount(connection, duelTokenOneAccount);
    expect(duelTokenOneAccountInfo.amount.toString()).to.be.equal("0");

    const instructions = [await program.methods.voteOne().accounts({
      authority: alice.publicKey,
      feePayer: alice.publicKey,
      mintAuthority: payerAccount,
      duelConfigAccount,
      duelAccount,
      userAccount,
      duelTokenOneAccount,
      tokenOne,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    }).instruction()];
    const transaction = new Transaction().add(...instructions);
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash("processed")
    ).blockhash;
    transaction.feePayer = alice.publicKey;
    const recoverTx = Transaction.from(
      transaction.serialize({ requireAllSignatures: false })
    );

    // transaction sign
    recoverTx.partialSign(alice);
    recoverTx.partialSign(payer);

    await connection.sendRawTransaction(recoverTx.serialize());

    // Ensure tx above is confirmed
    await transferSol(connection, payer, Keypair.generate().publicKey, 1);

    let userInfo = await program.account.user.fetch(userAccount);
    expect(userInfo.duelAccount.toString()).to.be.equal(duelAccount.toBase58());
    expect(userInfo.initialized).to.be.equal(true);
    expect(userInfo.user.toString()).to.be.equal(alice.publicKey.toBase58());
    expect(userInfo.totalVotedOne.toString()).to.be.equal("1");
    expect(userInfo.totalVotedTwo.toString()).to.be.equal("0");
    expect(userInfo.lastVoteTime.toNumber()).to.greaterThan(Number(startTime));
    expect(userInfo.lastVoteTime.toNumber()).to.lessThan(Number(endTime));

    let duelInfo = await program.account.duel.fetch(duelAccount);
    expect(duelInfo.id.toString()).to.be.equal(duelId.toString());
    expect(duelInfo.duelConfigAccount.toString()).to.be.equal(duelConfigAccount.toBase58());
    expect(duelInfo.tokenOne.toString()).to.be.equal(tokenOne.toBase58());
    expect(duelInfo.tokenTwo.toString()).to.be.equal(tokenTwo.toBase58());
    expect(duelInfo.duelTokenOneAccount.toString()).to.be.equal(duelTokenOneAccount.toBase58());
    expect(duelInfo.duelTokenTwoAccount.toString()).to.be.equal(duelTokenTwoAccount.toBase58());
    expect(duelInfo.totalVoteOne.toString()).to.be.equal("1");
    expect(duelInfo.totalVoteTwo.toString()).to.be.equal("0");
    expect(duelInfo.startDate.toString()).to.be.equal(startTime);
    expect(duelInfo.endDate.toString()).to.be.equal(endTime);
    expect(duelInfo.winner).to.be.equal(0);

    duelTokenOneAccountInfo = await getAccount(connection, duelTokenOneAccount);
    expect(duelTokenOneAccountInfo.amount.toString()).to.be.equal(LAMPORTS_PER_SOL.toString());
  });

  it("successful vote number two", async () => {
    let duelTokenTwoAccountInfo = await getAccount(connection, duelTokenTwoAccount);
    expect(duelTokenTwoAccountInfo.amount.toString()).to.be.equal("0");

    [userAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(USER_SEED), duelAccount.toBuffer(), bob.publicKey.toBuffer()],
      program.programId
    );

    const instructions = [await program.methods.voteTwo().accounts({
      authority: bob.publicKey,
      feePayer: bob.publicKey,
      mintAuthority: payerAccount,
      duelConfigAccount,
      duelAccount,
      userAccount,
      duelTokenTwoAccount,
      tokenTwo,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    }).instruction()];
    const transaction = new Transaction().add(...instructions);
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash("processed")
    ).blockhash;
    transaction.feePayer = bob.publicKey;
    const recoverTx = Transaction.from(
      transaction.serialize({ requireAllSignatures: false })
    );

    // transaction sign
    recoverTx.partialSign(bob);
    recoverTx.partialSign(payer);

    await connection.sendRawTransaction(recoverTx.serialize());

    // Ensure tx above is confirmed
    await transferSol(connection, payer, Keypair.generate().publicKey, 1);

    let userInfo = await program.account.user.fetch(userAccount);
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
    expect(duelInfo.duelTokenOneAccount.toString()).to.be.equal(duelTokenOneAccount.toBase58());
    expect(duelInfo.duelTokenTwoAccount.toString()).to.be.equal(duelTokenTwoAccount.toBase58());
    expect(duelInfo.totalVoteOne.toString()).to.be.equal("1");
    expect(duelInfo.totalVoteTwo.toString()).to.be.equal("1");
    expect(duelInfo.startDate.toString()).to.be.equal(startTime);
    expect(duelInfo.endDate.toString()).to.be.equal(endTime);
    expect(duelInfo.winner).to.be.equal(0);

    duelTokenTwoAccountInfo = await getAccount(connection, duelTokenTwoAccount);
    expect(duelTokenTwoAccountInfo.amount.toString()).to.be.equal(LAMPORTS_PER_SOL.toString());
  });

  it("cannot vote immediately", async () => {
    [userAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(USER_SEED), duelAccount.toBuffer(), alice.publicKey.toBuffer()],
      program.programId
    );

    try {
      const instructions = [await program.methods.voteOne().accounts({
        authority: alice.publicKey,
        feePayer: payerAccount,
        mintAuthority: payerAccount,
        duelConfigAccount,
        duelAccount,
        userAccount,
        duelTokenOneAccount,
        tokenOne,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      }).instruction()];
      const transaction = new Transaction().add(...instructions);
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash("processed")
      ).blockhash;
      transaction.feePayer = alice.publicKey;
      const recoverTx = Transaction.from(
        transaction.serialize({ requireAllSignatures: false })
      );

      // transaction sign
      recoverTx.partialSign(alice);
      recoverTx.partialSign(payer);

      await connection.sendRawTransaction(recoverTx.serialize());
    } catch (err) {
      expect(err).to.be.instanceOf(SendTransactionError);
      expect((err as SendTransactionError).message).to.equal("failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x1779");
    }
    try {
      const instructions = [await program.methods.voteTwo().accounts({
        authority: alice.publicKey,
        feePayer: payerAccount,
        mintAuthority: payerAccount,
        duelConfigAccount,
        duelAccount,
        userAccount,
        duelTokenTwoAccount,
        tokenTwo,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      }).instruction()];
      const transaction = new Transaction().add(...instructions);
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash("processed")
      ).blockhash;
      transaction.feePayer = alice.publicKey;
      const recoverTx = Transaction.from(
        transaction.serialize({ requireAllSignatures: false })
      );

      // transaction sign
      recoverTx.partialSign(alice);
      recoverTx.partialSign(payer);

      await connection.sendRawTransaction(recoverTx.serialize());
    } catch (err) {
      expect(err).to.be.instanceOf(SendTransactionError);
      expect((err as SendTransactionError).message).to.equal("failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x1779");
    }
  });

  it("cannot announce winner when duel not end", async () => {
    try {
      const instructions = [await program.methods.announceWinner().accounts({
        authority: payerAccount,
        authorityTokenAccount: payerTokenOneAccount,
        duelConfigAccount,
        duelAccount,
        duelTokenOneAccount,
        duelTokenTwoAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      }).instruction()];
      const transaction = new Transaction().add(...instructions);
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash("processed")
      ).blockhash;
      transaction.feePayer = payerAccount;
      const recoverTx = Transaction.from(
        transaction.serialize({ requireAllSignatures: false })
      );

      // transaction sign
      recoverTx.sign(payer);

      await connection.sendRawTransaction(recoverTx.serialize());
    } catch (err) {
      expect(err).to.be.instanceOf(SendTransactionError);
      expect((err as SendTransactionError).message).to.equal("failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x177d");
    }
  });
});
