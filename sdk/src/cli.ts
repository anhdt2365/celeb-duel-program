#! /usr/bin/env node

require("dotenv").config();
const fs = require("fs");
import { Command } from "commander";
import * as anchor from "@project-serum/anchor";
import { Program, Wallet } from "@project-serum/anchor";
import { SYSVAR_RENT_PUBKEY, PublicKey, Connection, SystemProgram } from "@solana/web3.js";
import { keypairFromJson, PDA, DuelClient, Context } from "./index";
import { CelebDuelProgram, IDL } from "./artifacts/celeb-duel-program";

const __path = process.cwd();

const figlet = require("figlet");
const program = new Command();

const MAINNET_RPC = "https://api-mainnet-beta.renec.foundation:8899/";
const TESTNET_RPC = "https://api-testnet.renec.foundation:8899/";
const LOCAL_RPC = "http://localhost:8899/";

console.log(figlet.textSync("Celeb Duel Program"));
console.log("");

const adminKey = JSON.parse(fs.readFileSync(__path + "/sdk/src/.wallets/admin.json"));

type Cluster = {
  program: Program<CelebDuelProgram>;
  provider: anchor.AnchorProvider;
};

async function connectCluster(
  rpc: string,
  ownerKey: number[],
  programId: PublicKey,
): Promise<Cluster> {
  const connection = new Connection(rpc);
  const wallet = new Wallet(keypairFromJson(ownerKey));
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    anchor.AnchorProvider.defaultOptions(),
  );
  const program = new Program(IDL, programId, provider) as Program<CelebDuelProgram>;
  return {
    program,
    provider,
  };
}

program
  .command("initialize")
  .description("create duel config")
  .option("-n, --network <string>", "Network: mainnet, testnet, localnet", "mainnet")
  .option("-m, --testMode <boolean>", "Test mode", false)
  .action(async (params) => {
    let { network, testMode } = params;

    console.log("Create Duel Config.");
    console.log("params:", params);

    if (!network || (network !== "mainnet" && network !== "testnet" && network !== "localnet")) {
      console.log("Error: -n, --network is required. [mainnet, testnet, localnet]");
      return;
    }

    let rpc = MAINNET_RPC;
    if (network === "testnet") {
      rpc = TESTNET_RPC;
    }
    if (network === "localnet") {
      rpc = LOCAL_RPC;
    }

    if (!process.env.PROGRAM_ID) {
      console.log("PROGRAM_ID is not found in .env file");
      return;
    }

    const { provider, program } = await connectCluster(
      rpc,
      adminKey,
      new PublicKey(process.env.PROGRAM_ID),
    );

    if (!provider.wallet.publicKey) {
      console.log("Error: Please provide admin key. `export ADMIN_KEY=`");
      return;
    }
    console.log(`RPC: ${rpc}`);
    console.log(`Admin: ${provider.wallet.publicKey.toBase58()}`);
    console.log(`Celeb Duel Program Id: ${program.programId.toBase58()}`);
    console.log();

    const pda = new PDA(program.programId);
    const duelConfig = pda.duel_config(provider.wallet.publicKey);
    const signature = await program.methods
      .initialize(testMode)
      .accounts({
        authority: provider.wallet.publicKey,
        duelConfigAccount: duelConfig.key,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log(`Duel config: ${duelConfig.key.toBase58()}`);
    console.log(`https://explorer.renec.foundation/tx/${signature}?cluster=${network}`);
    console.log("DONE");
  });

program
  .command("changeMode")
  .description("Test mode toggle.")
  .option("-n, --network <string>", "Network: mainnet, testnet, localnet", "mainnet")
  .option("-m, --testMode <boolean>", "Enable test mode or not", false)
  .action(async (params) => {
    let { network, testMode } = params;

    console.log("Test mode toggle.");
    console.log("params:", params);

    if (!network || (network !== "mainnet" && network !== "testnet" && network !== "localnet")) {
      console.log("Error: -n, --network is required. [mainnet, testnet, localnet]");
      return;
    }

    let rpc = MAINNET_RPC;
    if (network === "testnet") {
      rpc = TESTNET_RPC;
    }
    if (network === "localnet") {
      rpc = LOCAL_RPC;
    }

    if (!process.env.PROGRAM_ID) {
      console.log("PROGRAM_ID is not found in .env file");
      return;
    }

    const { program, provider } = await connectCluster(
      rpc,
      adminKey,
      new PublicKey(process.env.PROGRAM_ID),
    );

    if (!provider.wallet.publicKey) {
      console.log("Error: Please provide admin key. `export ADMIN_KEY=`");
      return;
    }
    console.log(`RPC: ${rpc}`);
    console.log(`Admin: ${provider.wallet.publicKey.toBase58()}`);
    console.log(`Celeb Duel Program Id: ${program.programId.toBase58()}`);
    console.log();

    const ctx = Context.withProvider(provider, program.programId);
    const duelClient = await DuelClient.getClient(ctx);
    const tx = await duelClient.changeMode(testMode);
    const signature = await tx.buildAndExecute();
    console.log(`https://explorer.renec.foundation/tx/${signature}?cluster=${network}`);
    console.log("DONE");
  });

// program
//   .command("createDuel")
//   .description("Create a new Duel.")
//   .option("-n, --network <string>", "Network: mainnet, testnet, localnet", "mainnet")
//   .option("-, --user <string>", "The user public key.")
//   .action(async (params) => {
//     let { network, user } = params;

//     console.log("Deactivate an user.");
//     console.log("params:", params);

//     if (!user || user === "") {
//       console.log("Error: -u, --user is required");
//       return;
//     }

//     if (!network || (network !== "mainnet" && network !== "testnet" && network !== "localnet")) {
//       console.log("Error: -n, --network is required. [mainnet, testnet, localnet]");
//       return;
//     }

//     let rpc = MAINNET_RPC;
//     if (network === "testnet") {
//       rpc = TESTNET_RPC;
//     }
//     if (network === "localnet") {
//       rpc = LOCAL_RPC;
//     }

//     if (!process.env.PROGRAM_ID) {
//       console.log("PROGRAM_ID is not found in .env file");
//       return;
//     }
//     user = new PublicKey(user);

//     const { program, provider } = await connectCluster(
//       rpc,
//       adminKey,
//       new PublicKey(process.env.PROGRAM_ID),
//     );

//     if (!provider.publicKey) {
//       console.log("Error: Please provide admin key. `export ADMIN_KEY=`");
//       return;
//     }
//     console.log(`RPC: ${rpc}`);
//     console.log(`Admin: ${provider.publicKey.toBase58()}`);
//     console.log(`Kyc Program Id: ${program.programId.toBase58()}`);
//     console.log();

//     const ctx = Context.withProvider(provider, program.programId);
//     const kycClient = await KycClient.getClient(ctx);
//     const tx = await kycClient.deactivateUser(user);
//     const signature = await tx.buildAndExecute();
//     console.log(`https://explorer.renec.foundation/tx/${signature}?cluster=${network}`);
//     console.log("DONE");
//   });

// program
//   .command("submitKyc")
//   .description("Submit a KYC of user.")
//   .option("-pn, --providerName <string>", "The provider name")
//   .option("-u, --user <string>", "The user public key")
//   .option("-s, --salt <string>", "The hashing salt")
//   .option("-kl, --kycLevel <number>", "The level of KYC. Example: 1")
//   .option("-un, --userName <string>", "The name of User. Example: `Michel Jordan`")
//   .option("-di, --documentId <string>", "The user document ID")
//   .option("-c, --country <string>", "The user country. Example: vn")
//   .option(
//     "-db, --dateOfBirth <string>",
//     "The UTC time of user birthday, with yyyy-mm-dd format. Example: `2019-01-16`",
//   )
//   .option(
//     "-de, --dateOfExpired <string>",
//     "The expired day of user documents, with yyyy-mm-dd format. Example: `2019-01-16`",
//   )
//   .option("-g, --gender <string>", "The gender of user. Example: male")
//   .option("-ie, --isExpired <boolean>", "The user KYC status", false)
//   .option("-nhr, --nameHashRound <number>", "The number of Name hashing round", "1000")
//   .option("-dhr, --documentIdHashRound <number>", "The number of DocumentId hashing round", "1000")
//   .option("-dbhr, --dobHashRound <number>", "The number of Date of Birth hashing round", "1000")
//   .option("-dehr, --doeHashRound <number>", "The number of Date of Expired hashing round", "1000")
//   .option("-ghr, --genderHashRound <number>", "The number of Gender hashing round", "1000")
//   .option("-n, --network <string>", "Network: mainnet, testnet, localnet", "mainnet")
//   .action(async (params) => {
//     let {
//       providerName,
//       user,
//       salt,
//       kycLevel,
//       network,
//       userName,
//       documentId,
//       country,
//       dateOfBirth,
//       dateOfExpired,
//       gender,
//       isExpired,
//       nameHashRound,
//       documentIdHashRound,
//       dobHashRound,
//       doeHashRound,
//       genderHashRound,
//     } = params;
//     console.log("Submit a KYC of new user.");
//     console.log("params:", params);

//     if (!providerName || providerName === "") {
//       console.log("Error: -pn, --providerName is required");
//       return;
//     }
//     if (providerName.length > 20) {
//       console.log("Error: providerName cannot exceed 20 characters");
//       return;
//     }
//     if (!kycLevel) {
//       console.log("Error: -kl, --kycLevel is required");
//       return;
//     }
//     if (!userName || userName === "") {
//       console.log("Error: -un, --userName is required");
//       return;
//     }
//     if (!documentId || documentId === "") {
//       console.log("Error: -di, --documentId is required");
//       return;
//     }
//     if (!country || country === "") {
//       console.log("Error: -c, --country is required");
//       return;
//     }
//     if (!dateOfBirth || dateOfBirth === "") {
//       console.log("Error: -c, --country is required");
//       return;
//     }
//     if (dateOfExpired == "") {
//       dateOfExpired = null;
//     }
//     if (gender == "") {
//       gender = null;
//     }
//     if (gender && (gender != "male" || gender != "female")) {
//       console.log("Error: -g, --gender is invalid, only 'male' or 'female'");
//       return;
//     }
//     if (!network || (network !== "mainnet" && network !== "testnet" && network !== "localnet")) {
//       console.log("Error: -n, --network is required. [mainnet, testnet, localnet]");
//       return;
//     }
//     user = new PublicKey(user);
//     let rpc = MAINNET_RPC;
//     if (network === "testnet") {
//       rpc = TESTNET_RPC;
//     }
//     if (network === "localnet") {
//       rpc = LOCAL_RPC;
//     }
//     if (!process.env.PROGRAM_ID) {
//       console.log("PROGRAM_ID is not found in .env file");
//       return;
//     }
//     const { provider, program } = await connectCluster(
//       rpc,
//       providerKey,
//       new PublicKey(process.env.PROGRAM_ID),
//     );

//     if (!provider.wallet.publicKey) {
//       console.log("Error: Please provide provider key. `export PROVIDER_KEY=`");
//       return;
//     }
//     console.log(`RPC: ${rpc}`);
//     console.log(`Provider: ${provider.wallet.publicKey.toBase58()}`);
//     console.log(`Kyc Program Id: ${program.programId.toBase58()}`);
//     console.log();

//     const ctx = Context.withProvider(provider, program.programId);
//     const providerClient = await ProviderClient.getClient(
//       ctx,
//       nameHashRound,
//       documentIdHashRound,
//       dobHashRound,
//       doeHashRound,
//       genderHashRound,
//     );

//     const pda = new PDA(program.programId);
//     const userConfig = pda.user_config(user);
//     const userKyc = pda.user_kyc(user, SystemProgram.programId);
//     const tx = await providerClient.submitKyc(
//       providerName,
//       user,
//       salt,
//       kycLevel,
//       userName,
//       documentId,
//       country,
//       new Date(dateOfBirth),
//       dateOfExpired ? new Date(dateOfExpired) : dateOfExpired,
//       gender ? gender : null,
//       isExpired,
//     );
//     const signature = await tx.buildAndExecute();

//     console.log(`User config: ${userConfig.key.toBase58()}`);
//     console.log(`User Kyc: ${userKyc.key.toBase58()}`);
//     console.log(`https://explorer.renec.foundation/tx/${signature}?cluster=${network}`);
//     console.log("DONE");
//   });

// program
//   .command("updateKyc")
//   .description("Update a KYC of user.")
//   .option("-pn, --providerName", "The Provider name")
//   .option("-u, --user <string>", "The user public key")
//   .option("-un, --userName <string>", "The name of User. Example: `Michel Jordan`")
//   .option("-di, --documentId <string>", "The user document ID")
//   .option("-c, --country <string>", "The user country. Example: vn")
//   .option(
//     "-db, --dateOfBirth <string>",
//     "The UTC time of user birthday, with yyyy-mm-dd format. Example: `2019-01-16`",
//   )
//   .option(
//     "-de, --dateOfExpired <string>",
//     "The expired day of user documents, with yyyy-mm-dd format. Example: `2019-01-16`",
//   )
//   .option("-g, --gender <string>", "The gender of user. Example: male")
//   .option("-ie, --isExpired <boolean>", "The user KYC status", false)
//   .option("-nhr, --nameHashRound <number>", "The number of Name hashing round", "1000")
//   .option("-dhr, --documentIdHashRound <number>", "The number of DocumentId hashing round", "1000")
//   .option("-dbhr, --dobHashRound <number>", "The number of Date of Birth hashing round", "1000")
//   .option("-dehr, --doeHashRound <number>", "The number of Date of Expired hashing round", "1000")
//   .option("-ghr, --genderHashRound <number>", "The number of Gender hashing round", "1000")
//   .option("-n, --network <string>", "Network: mainnet, testnet, localnet", "mainnet")
//   .action(async (params) => {
//     let {
//       providerName,
//       user,
//       network,
//       userName,
//       documentId,
//       country,
//       dateOfBirth,
//       dateOfExpired,
//       gender,
//       isExpired,
//       nameHashRound,
//       documentIdHashRound,
//       dobHashRound,
//       doeHashRound,
//       genderHashRound,
//     } = params;
//     console.log("Update KYC information for user.");
//     console.log("params:", params);

//     if (!userName || userName === "") {
//       console.log("Error: -un, --userName is required");
//       return;
//     }
//     if (!documentId || documentId === "") {
//       console.log("Error: -di, --documentId is required");
//       return;
//     }
//     if (!country || country === "") {
//       console.log("Error: -c, --country is required");
//       return;
//     }
//     if (!dateOfBirth || dateOfBirth === "") {
//       console.log("Error: -c, --country is required");
//       return;
//     }
//     if (dateOfExpired == "") {
//       dateOfExpired = null;
//     }
//     if (gender == "") {
//       gender = null;
//     }
//     if (gender && (gender != "male" || gender != "female")) {
//       console.log("Error: -g, --gender is invalid, only 'male' or 'female'");
//       return;
//     }
//     if (!network || (network !== "mainnet" && network !== "testnet" && network !== "localnet")) {
//       console.log("Error: -n, --network is required. [mainnet, testnet, localnet]");
//       return;
//     }
//     user = new PublicKey(user);
//     let rpc = MAINNET_RPC;
//     if (network === "testnet") {
//       rpc = TESTNET_RPC;
//     }
//     if (network === "localnet") {
//       rpc = LOCAL_RPC;
//     }
//     if (!process.env.PROGRAM_ID) {
//       console.log("PROGRAM_ID is not found in .env file");
//       return;
//     }
//     const { provider, program } = await connectCluster(
//       rpc,
//       providerKey,
//       new PublicKey(process.env.PROGRAM_ID),
//     );
//     if (!provider.wallet.publicKey) {
//       console.log("Error: Please provide provider key. `export PROVIDER_KEY=`");
//       return;
//     }
//     console.log(`RPC: ${rpc}`);
//     console.log(`Provider: ${provider.wallet.publicKey.toBase58()}`);
//     console.log(`Kyc Program Id: ${program.programId.toBase58()}`);
//     console.log();

//     const ctx = Context.withProvider(provider, program.programId);
//     const providerClient = await ProviderClient.getClient(
//       ctx,
//       nameHashRound,
//       documentIdHashRound,
//       dobHashRound,
//       doeHashRound,
//       genderHashRound,
//     );
//     const pda = new PDA(program.programId);
//     const userConfig = pda.user_config(user);
//     const userKyc = pda.user_kyc(user, SystemProgram.programId);

//     const tx = await providerClient.updateKyc(
//       providerName,
//       user,
//       userName,
//       documentId,
//       country,
//       new Date(dateOfBirth),
//       dateOfExpired ? new Date(dateOfExpired) : dateOfExpired,
//       gender ? gender : null,
//       isExpired,
//     );
//     const signature = await tx.buildAndExecute();

//     console.log(`User config: ${userConfig.key.toBase58()}`);
//     console.log(`User Kyc: ${userKyc.key.toBase58()}`);
//     console.log(`https://explorer.renec.foundation/tx/${signature}?cluster=${network}`);
//     console.log("DONE");
//   });

program.parse();
