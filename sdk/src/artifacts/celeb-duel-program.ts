export type CelebDuelProgram = {
  version: "0.1.0";
  name: "celeb_duel_program";
  instructions: [
    {
      name: "initialize";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "feePayer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "duelConfigAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: "testMode";
          type: "bool";
        },
      ];
    },
    {
      name: "changeMode";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "duelConfigAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: "testMode";
          type: "bool";
        },
      ];
    },
    {
      name: "createDuel";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "feePayer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "duelConfigAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "duelAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "duelTokenOneAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "duelTokenTwoAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenOne";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenTwo";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: "id";
          type: "u64";
        },
        {
          name: "startDate";
          type: "u64";
        },
        {
          name: "endDate";
          type: "u64";
        },
      ];
    },
    {
      name: "voteOne";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "mintAuthority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "feePayer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "duelConfigAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "duelAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "duelTokenOneAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenOne";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: "voteTwo";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "mintAuthority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "feePayer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "duelConfigAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "duelAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "duelTokenTwoAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenTwo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: "announceWinner";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "authorityTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "duelConfigAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "duelAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "duelTokenOneAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "duelTokenTwoAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: "duelConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: {
              array: ["u8", 1];
            };
          },
          {
            name: "admin";
            type: "publicKey";
          },
          {
            name: "latestDuelId";
            type: "u64";
          },
          {
            name: "testMode";
            type: "bool";
          },
        ];
      };
    },
    {
      name: "duel";
      type: {
        kind: "struct";
        fields: [
          {
            name: "id";
            type: "u64";
          },
          {
            name: "duelConfigAccount";
            type: "publicKey";
          },
          {
            name: "bump";
            type: {
              array: ["u8", 1];
            };
          },
          {
            name: "tokenOneBump";
            type: {
              array: ["u8", 1];
            };
          },
          {
            name: "tokenTwoBump";
            type: {
              array: ["u8", 1];
            };
          },
          {
            name: "tokenOne";
            type: "publicKey";
          },
          {
            name: "tokenTwo";
            type: "publicKey";
          },
          {
            name: "duelTokenOneAccount";
            type: "publicKey";
          },
          {
            name: "duelTokenTwoAccount";
            type: "publicKey";
          },
          {
            name: "totalVoteOne";
            type: "u64";
          },
          {
            name: "totalVoteTwo";
            type: "u64";
          },
          {
            name: "startDate";
            type: "u64";
          },
          {
            name: "endDate";
            type: "u64";
          },
          {
            name: "winner";
            type: "u8";
          },
        ];
      };
    },
    {
      name: "user";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: {
              array: ["u8", 1];
            };
          },
          {
            name: "duelAccount";
            type: "publicKey";
          },
          {
            name: "initialized";
            type: "bool";
          },
          {
            name: "user";
            type: "publicKey";
          },
          {
            name: "totalVotedOne";
            type: "u64";
          },
          {
            name: "totalVotedTwo";
            type: "u64";
          },
          {
            name: "lastVoteTime";
            type: "u64";
          },
        ];
      };
    },
  ];
  errors: [
    {
      code: 6000;
      name: "OnlyAdmin";
      msg: "Only Admin";
    },
    {
      code: 6001;
      name: "OnlyAccountOwner";
      msg: "Only Vote Account owner";
    },
    {
      code: 6002;
      name: "ModeNotChange";
      msg: "Mode not change";
    },
    {
      code: 6003;
      name: "MustDifferentMint";
      msg: "Duel must be between 2 different mint";
    },
    {
      code: 6004;
      name: "InvalidDuelAndDuelConfigAccount";
      msg: "Invalid Duel and Duel Config Account";
    },
    {
      code: 6005;
      name: "InvalidUserAndDuelAccount";
      msg: "Invalid User and Duel Account";
    },
    {
      code: 6006;
      name: "InvalidMint";
      msg: "Invalid Mint";
    },
    {
      code: 6007;
      name: "AccountAlreadyInit";
      msg: "Vote Account already init";
    },
    {
      code: 6008;
      name: "NotInVoteTime";
      msg: "Not in voting period";
    },
    {
      code: 6009;
      name: "OnlyOneVote";
      msg: "Only one vote per day";
    },
    {
      code: 6010;
      name: "InvalidVoteTime";
      msg: "Start date must be smaller than end date";
    },
    {
      code: 6011;
      name: "InvalidMintAuthority";
      msg: "Invalid Mint Authority";
    },
    {
      code: 6012;
      name: "MintFailed";
      msg: "Mint failed";
    },
    {
      code: 6013;
      name: "DuelIsGoingOn";
      msg: "Duel is going on";
    },
    {
      code: 6014;
      name: "WinnerAlreadyAnnounced";
      msg: "Winner already announced";
    },
    {
      code: 6015;
      name: "InvalidAdminTokenAccount";
      msg: "Invalid Admin Token Account";
    },
  ];
};

export const IDL: CelebDuelProgram = {
  version: "0.1.0",
  name: "celeb_duel_program",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "feePayer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "duelConfigAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "testMode",
          type: "bool",
        },
      ],
    },
    {
      name: "changeMode",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "duelConfigAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "testMode",
          type: "bool",
        },
      ],
    },
    {
      name: "createDuel",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "feePayer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "duelConfigAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "duelAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "duelTokenOneAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "duelTokenTwoAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenOne",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenTwo",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "id",
          type: "u64",
        },
        {
          name: "startDate",
          type: "u64",
        },
        {
          name: "endDate",
          type: "u64",
        },
      ],
    },
    {
      name: "voteOne",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "mintAuthority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "feePayer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "duelConfigAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "duelAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "duelTokenOneAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenOne",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "voteTwo",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "mintAuthority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "feePayer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "duelConfigAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "duelAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "duelTokenTwoAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenTwo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "announceWinner",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "authorityTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "duelConfigAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "duelAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "duelTokenOneAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "duelTokenTwoAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "duelConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: {
              array: ["u8", 1],
            },
          },
          {
            name: "admin",
            type: "publicKey",
          },
          {
            name: "latestDuelId",
            type: "u64",
          },
          {
            name: "testMode",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "duel",
      type: {
        kind: "struct",
        fields: [
          {
            name: "id",
            type: "u64",
          },
          {
            name: "duelConfigAccount",
            type: "publicKey",
          },
          {
            name: "bump",
            type: {
              array: ["u8", 1],
            },
          },
          {
            name: "tokenOneBump",
            type: {
              array: ["u8", 1],
            },
          },
          {
            name: "tokenTwoBump",
            type: {
              array: ["u8", 1],
            },
          },
          {
            name: "tokenOne",
            type: "publicKey",
          },
          {
            name: "tokenTwo",
            type: "publicKey",
          },
          {
            name: "duelTokenOneAccount",
            type: "publicKey",
          },
          {
            name: "duelTokenTwoAccount",
            type: "publicKey",
          },
          {
            name: "totalVoteOne",
            type: "u64",
          },
          {
            name: "totalVoteTwo",
            type: "u64",
          },
          {
            name: "startDate",
            type: "u64",
          },
          {
            name: "endDate",
            type: "u64",
          },
          {
            name: "winner",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "user",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: {
              array: ["u8", 1],
            },
          },
          {
            name: "duelAccount",
            type: "publicKey",
          },
          {
            name: "initialized",
            type: "bool",
          },
          {
            name: "user",
            type: "publicKey",
          },
          {
            name: "totalVotedOne",
            type: "u64",
          },
          {
            name: "totalVotedTwo",
            type: "u64",
          },
          {
            name: "lastVoteTime",
            type: "u64",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "OnlyAdmin",
      msg: "Only Admin",
    },
    {
      code: 6001,
      name: "OnlyAccountOwner",
      msg: "Only Vote Account owner",
    },
    {
      code: 6002,
      name: "ModeNotChange",
      msg: "Mode not change",
    },
    {
      code: 6003,
      name: "MustDifferentMint",
      msg: "Duel must be between 2 different mint",
    },
    {
      code: 6004,
      name: "InvalidDuelAndDuelConfigAccount",
      msg: "Invalid Duel and Duel Config Account",
    },
    {
      code: 6005,
      name: "InvalidUserAndDuelAccount",
      msg: "Invalid User and Duel Account",
    },
    {
      code: 6006,
      name: "InvalidMint",
      msg: "Invalid Mint",
    },
    {
      code: 6007,
      name: "AccountAlreadyInit",
      msg: "Vote Account already init",
    },
    {
      code: 6008,
      name: "NotInVoteTime",
      msg: "Not in voting period",
    },
    {
      code: 6009,
      name: "OnlyOneVote",
      msg: "Only one vote per day",
    },
    {
      code: 6010,
      name: "InvalidVoteTime",
      msg: "Start date must be smaller than end date",
    },
    {
      code: 6011,
      name: "InvalidMintAuthority",
      msg: "Invalid Mint Authority",
    },
    {
      code: 6012,
      name: "MintFailed",
      msg: "Mint failed",
    },
    {
      code: 6013,
      name: "DuelIsGoingOn",
      msg: "Duel is going on",
    },
    {
      code: 6014,
      name: "WinnerAlreadyAnnounced",
      msg: "Winner already announced",
    },
    {
      code: 6015,
      name: "InvalidAdminTokenAccount",
      msg: "Invalid Admin Token Account",
    },
  ],
};
