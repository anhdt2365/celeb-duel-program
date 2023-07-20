# celeb-duel-sdk

## How to use

### 1. Create Provider Config
```javascript
import {
  PublicKey,
  Connection,
  Keypair,
  Commitment,
} from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@project-serum/anchor";
import { Context, KycClient, ProviderClient, KYC_PROGRAM_ID_TESTNET } from "@renec-foundation/kyc-sdk";


...

// yourKey = Keypair.fromSecretKey(Uint8Array.from([124, 149, 222, 31, 236, 142, 29, 95...]));

const commitment: Commitment = "confirmed";
const connection = new Connection(const.RPC_ENDPOINT_URL, { commitment });
const wallet = new Wallet(yourKey);
const provider = new AnchorProvider(connection, wallet, { commitment });

const ctx = Context.withProvider(provider, new PublicKey(KYC_PROGRAM_ID_TESTNET));

const kycClient = await KycClient.getClient(ctx);

const tx = await kycClient.createProviderConfig(
    providerPubkey,
    providerName
);

await tx.buildAndExecute();

const providerConfig = await kycClient.getProviderConfigByProviderName(providerName);
console.log("providerConfig", providerConfig);
```

+ Output
```
providerConfig {
  provider: PublicKey [PublicKey(DWf39ga2tvvqh1xJAD8t5nepCE6opM9tW6Lzhwj3oF5x)] {
    _bn: <BN: b9e51860a0c3ddd72c830c4f301dc3ca881279f114ff6386ef94408f912cdb27>
  },
  name: 'renec_blockchain',
  deactivate: false,
  admin: PublicKey [PublicKey(5e7ApvnZii1zPQozT6sBMVA7ot7iDtSuN8cFKKXzUbzb)] {
    _bn: <BN: 44f036a317cb0de4aa64035c35f58c3a995fabf20380e130a229dc69682e8cdc>
  },
  bump: [ 254 ]
}
```


### 2. Submit KYC
```javascript
import {
  PublicKey,
  Connection,
  Keypair,
  Commitment,
} from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@project-serum/anchor";
import { Context, ProviderClient, KYC_PROGRAM_ID_TESTNET } from "@renec-foundation/kyc-sdk";


...

// yourKey = Keypair.fromSecretKey(Uint8Array.from([124, 149, 222, 31, 236, 142, 29, 95...]));

const commitment: Commitment = "confirmed";
const connection = new Connection(const.RPC_ENDPOINT_URL, { commitment });
const wallet = new Wallet(yourKey);
const provider = new AnchorProvider(connection, wallet, { commitment });

const ctx = Context.withProvider(provider, new PublicKey(KYC_PROGRAM_ID_TESTNET));

const nameHashRound = 10000;
const documentIdHashRound = 1000000;
const dobHashRound = 10000;
const doeHashRound = 10000;
const genderHashRound = 1000;

const salt = "salt_to_hash";

const providerClient = await ProviderClient.getClient(
    ctx,
    nameHashRound,
    documentIdHashRound,
    dobHashRound,
    doeHashRound,
    genderHashRound
);

const kycLevel = 1;
const name = "Tieu Anh Tien";
const documentId = "9899998923321";
const country = "vn";
const dob = new Date("2019-01-16");
const doe = null;
const gender = null;
const isExpired = false;

const tx = await providerClient.submitKyc(
    providerName,
    userPubkey,
    salt,
    kycLevel,
    name,
    documentId,
    country,
    dob,
    doe,
    gender,
    isExpired
);

await tx.buildAndExecute();

const userConfigData = await providerClient.getUserConfig(user.publicKey);
console.log("userConfigData", userConfigData);

const userKycData = await providerClient.getCurrentUserKyc(providerPubkey);
console.log("userKycData", userKycData);
```

+ Output
```
userConfigData {
  admin: PublicKey [PublicKey(EtUS32vLSTMXYHzNtaCB1yrj1aJgQWHjMPbxRVDA7P2X)] {
    _bn: <BN: ce57917feea7f46d467a199f4e0aa1e3a34c8eb83ac3a9568359669bb4f22570>
  },
  user: PublicKey [PublicKey(GvYBaorsRCebqHVC67AvNXVEQi37TfCYov6ntQ3rGMvy)] {
    _bn: <BN: ec96584b644a4311cf60e74c6a52925f09e71e6a0a843970aa8e0fd48d48d0f2>
  },
  salt: "salt_to_hash",
  kycLevel: 1,
  provider: PublicKey [PublicKey(GeCiWwpgjbDScbY9u3r5K9t5u1SfyTeZ35QWxwaFuLrs)] {
    _bn: <BN: e8670a7a2610963bfb00b2585747ce0b26150089e96004483009ccaabdfc9b98>
  },
  deactivate: false,
  latestKycAccount: PublicKey [PublicKey(23yiZ4ahKLomokCyLCfaShs6f5yoJEyooFHK13Bjmkpe)] {
    _bn: <BN: f9efa5f1612ad466af76f85986398ab340ea82f68ac1a3e47a3ae2a7f02c217>
  },
  bump: [ 252 ]
}


userKycData {
  userConfigAccount: PublicKey [PublicKey(EtUS32vLSTMXYHzNtaCB1yrj1aJgQWHjMPbxRVDA7P2X)] {
    _bn: <BN: ce57917feea7f46d467a199f4e0aa1e3a34c8eb83ac3a9568359669bb4f22570>
  },
  name: [
    84, 105, 101, 117, 32, 65, 110, 104, 32,
    84, 105, 101, 110,  0,  0,   0,   0,  0,
     0,   0,   0,   0,  0,  0,   0,   0,  0,
     0,   0,   0,   0,  0
  ],
  documentId: [
    57, 56, 57, 57, 57, 57, 56, 57, 50,
    51, 51, 50, 49,  0,  0,  0,  0,  0,
     0,  0,  0,  0,  0,  0,  0,  0,  0,
     0,  0,  0,  0,  0
  ],
  country: "vn",
  dob: [
    83, 245, 32, 0, 0, 0, 0, 0, 0,
     0,   0,  0, 0, 0, 0, 0, 0, 0,
     0,   0,  0, 0, 0, 0, 0, 0, 0,
     0,   0,  0, 0, 0
  ],
  doe: [
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0
  ],
  gender: [
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0
  ],
  isExpired: false,
  timestamp: <BN: 64952fd6>,
  prevKycAccount: PublicKey [PublicKey(11111111111111111111111111111111)] {
    _bn: <BN: 0>
  },
  bump: [ 255 ]
}
```


### 3. Update KYC
```javascript
import {
  PublicKey,
  Connection,
  Keypair,
  Commitment,
} from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@project-serum/anchor";
import { Context, KYC_PROGRAM_ID_TESTNET, Gender } from "@renec-foundation/kyc-sdk";


...

// yourKey = Keypair.fromSecretKey(Uint8Array.from([124, 149, 222, 31, 236, 142, 29, 95...]));

const commitment: Commitment = "confirmed";
const connection = new Connection(const.RPC_ENDPOINT_URL, { commitment });
const wallet = new Wallet(yourKey);
const provider = new AnchorProvider(connection, wallet, { commitment });

const ctx = Context.withProvider(provider, new PublicKey(KYC_PROGRAM_ID_TESTNET));

const nameHashRound = 10000;
const documentIdHashRound = 1000000;
const dobHashRound = 10000;
const doeHashRound = 10000;
const genderHashRound = 1000;

const salt = "salt_to_hash";

const providerClient = await ProviderClient.getClient(
    ctx,
    nameHashRound,
    documentIdHashRound,
    dobHashRound,
    doeHashRound,
    genderHashRound
);

const name = "Tieu Anh Tien";
const documentId = "9899998923321";
const country = "us";
const dob = new Date("2019-01-16");
const doe = null;
const gender = Gender.Male;
const isExpired = false;

const tx = await providerClient.updateKyc(
    providerName,
    userPubkey,
    name,
    documentId,
    country,
    dob,
    doe,
    gender,
    isExpired
);

await tx.buildAndExecute();

const userKycData = await providerClient.getCurrentUserKyc(user.publicKey);
console.log("userKycData", userKycData);
```

+ Output
```
userKycData {
  userConfigAccount: PublicKey [PublicKey(9kwHq4TVshNFByEnD31ZH5jhnhsiDpekqNEiALEedZUv)] {
    _bn: <BN: 821edb345bb2093308d8be79c06f69123b7de440c0fb01d3bb2473db5020e923>
  },
  name: [
    84, 105, 101, 117, 32, 65, 110, 104, 32,
    84, 105, 101, 110,  0,  0,   0,   0,  0,
     0,   0,   0,   0,  0,  0,   0,   0,  0,
     0,   0,   0,   0,  0
  ],
  documentId: [
    57, 56, 57, 57, 57, 57, 56, 57, 50,
    51, 51, 50, 50,  0,  0,  0,  0,  0,
     0,  0,  0,  0,  0,  0,  0,  0,  0,
     0,  0,  0,  0,  0
  ],
  country: "us",
  dob: [
    89, 27, 124, 0, 0, 0, 0, 0, 0,
     0,  0,   0, 0, 0, 0, 0, 0, 0,
     0,  0,   0, 0, 0, 0, 0, 0, 0,
     0,  0,   0, 0, 0
  ],
  doe: [
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0
  ],
  gender: [
    109, 97, 108, 101, 0, 0, 0, 0, 0,
      0,  0,   0,   0, 0, 0, 0, 0, 0,
      0,  0,   0,   0, 0, 0, 0, 0, 0,
      0,  0,   0,   0, 0
  ],
  isExpired: false,
  timestamp: <BN: 6495308c>,
  prevKycAccount: PublicKey [PublicKey(2avtwhtq8Bb4W3HqvFnKZvR6fdBbxVmxujq19sSyp6Zj)] {
    _bn: <BN: 178ccb25ad52257ade91c7d74cce42400cc4a2e3c6986d37529450af34a57316>
  },
  bump: [ 251 ]
}
```