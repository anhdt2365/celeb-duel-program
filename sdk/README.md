# celeb-duel-sdk

## How to use

### 1. Check user can vote
```javascript
import {
  PublicKey,
  Connection,
  Keypair,
  Commitment,
} from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@project-serum/anchor";
import { Context, DuelClient, CELEB_DUEL_PROGRAM_ID, DUEL_CONFIG_ACCOUNT } from "@renec-foundation/celeb-duel-sdk";


...

// yourKey = Keypair.fromSecretKey(Uint8Array.from([124, 149, 222, 31, 236, 142, 29, 95...]));

const commitment: Commitment = "confirmed";
const connection = new Connection(const.RPC_ENDPOINT_URL, { commitment });
const wallet = new Wallet(yourKey);
const provider = new AnchorProvider(connection, wallet, { commitment });

const ctx = Context.withProvider(provider, new PublicKey(CELEB_DUEL_PROGRAM_ID));

const duelClient = await DuelClient.getClient(ctx, new PublicKey(DUEL_CONFIG_ACCOUNT));

const canVote = await duelClient.canVote(duelId, user.publicKey);
console.log(`User can vote now?: ${canVote}`)
```

### 2. Vote One
```javascript
import {
  PublicKey,
  Connection,
  Keypair,
  Commitment,
} from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@project-serum/anchor";
import { Context, DuelClient, CELEB_DUEL_PROGRAM_ID, DUEL_CONFIG_ACCOUNT } from "@renec-foundation/celeb-duel-sdk";


...

// yourKey = Keypair.fromSecretKey(Uint8Array.from([124, 149, 222, 31, 236, 142, 29, 95...]));

const commitment: Commitment = "confirmed";
const connection = new Connection(const.RPC_ENDPOINT_URL, { commitment });
const wallet = new Wallet(yourKey);
const provider = new AnchorProvider(connection, wallet, { commitment });

const ctx = Context.withProvider(provider, new PublicKey(CELEB_DUEL_PROGRAM_ID));

const duelClient = await DuelClient.getClient(ctx, new PublicKey(DUEL_CONFIG_ACCOUNT));

// client.buildVoteOneIx(duelId, user, feePayer)
const instructions = [await client.buildVoteOneIx(duelId, user.publicKey, user.publicKey)];
const transaction = new Transaction().add(...instructions);
transaction.recentBlockhash = (
  await connection.getLatestBlockhash("processed")
).blockhash;
transaction.feePayer = user.publicKey;

const recoverTx = Transaction.from(
  transaction.serialize({ requireAllSignatures: false })
);

// Fee Payer Sign
// recoverTx.partialSign(user); ----> user already sign below, uncomment if the feePayer is GasLess service
let signedTx = await userWallet.signTransaction(recoverTx);
await connection.sendRawTransaction(signedTx.serialize());


const userVoteData = await duelClient.getUserByUserPublicKey(user.publicKey);
console.log("userVoteData", userVoteData);
```


### 3. Vote Two
```javascript
import {
  PublicKey,
  Connection,
  Keypair,
  Commitment,
} from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@project-serum/anchor";
import { Context, DuelClient, CELEB_DUEL_PROGRAM_ID, DUEL_CONFIG_ACCOUNT } from "@renec-foundation/celeb-duel-sdk";


...
// yourKey = Keypair.fromSecretKey(Uint8Array.from([124, 149, 222, 31, 236, 142, 29, 95...]));

const commitment: Commitment = "confirmed";
const connection = new Connection(const.RPC_ENDPOINT_URL, { commitment });
const wallet = new Wallet(yourKey);
const provider = new AnchorProvider(connection, wallet, { commitment });

// Build and sign transaction in BE, then encode to send to FE
const ctx = Context.withProvider(provider, new PublicKey(CELEB_DUEL_PROGRAM_ID));

const duelClient = await DuelClient.getClient(ctx, new PublicKey(DUEL_CONFIG_ACCOUNT));

// client.buildVoteTwoIx(duelId, user, feePayer)
const instructions = [await client.buildVoteTwoIx(duelId, user.publicKey, user.publicKey)];
const transaction = new Transaction().add(...instructions);
transaction.recentBlockhash = (
  await connection.getLatestBlockhash("processed")
).blockhash;
transaction.feePayer = user.publicKey;

const recoverTx = Transaction.from(
  transaction.serialize({ requireAllSignatures: false })
);

// Fee Payer Sign
// recoverTx.partialSign(user); ----> user already sign below, uncomment if the feePayer is GasLess service
let signedTx = await userWallet.signTransaction(recoverTx);
await connection.sendRawTransaction(signedTx.serialize());


const userVoteData = await duelClient.getUserByUserPublicKey(user.publicKey);
console.log("userVoteData", userVoteData);
```

### 4. Announce Winner
```javascript
import {
  PublicKey,
  Connection,
  Keypair,
  Commitment,
} from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@project-serum/anchor";
import { Context, DuelClient, CELEB_DUEL_PROGRAM_ID, DuelResult } from "@renec-foundation/celeb-duel-sdk";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";


...
// yourKey = Keypair.fromSecretKey(Uint8Array.from([124, 149, 222, 31, 236, 142, 29, 95...]));

const commitment: Commitment = "confirmed";
const connection = new Connection(const.RPC_ENDPOINT_URL, { commitment });
const wallet = new Wallet(yourKey);
const provider = new AnchorProvider(connection, wallet, { commitment });

const ctx = Context.withProvider(provider, new PublicKey(CELEB_DUEL_PROGRAM_ID));

const duelClient = await DuelClient.getClient(ctx);

const duelInfo = await DuelClient.getDuelById(duelId);

const adminTokenOneAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    yourKey,
    duelInfo.tokenOne,
    yourKey.publicKey
);
const adminTokenTwoAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    yourKey,
    duelInfo.tokenTwo,
    yourKey.publicKey
);

const duelResult = await duelClient.getDuelResult(duelId);
let adminTokenAccount;

switch (duelResult) {
  case DuelResult.OneWin:
    adminTokenAccount = adminTokenOneAccount;
    break;
  case DuelResult.OneWin:
    adminTokenAccount = adminTokenTwoAccount;
    break;
  case DuelResult.Tie:
    throw Error("Tie");
};
const tx = await duelClient.announceWinner(
  duelId,
  adminTokenAccount,
);
const txSignature = await tx.buildAndExecute();
```
