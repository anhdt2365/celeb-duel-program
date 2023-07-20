import { AnchorProvider, Program } from "@project-serum/anchor";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import { ConfirmOptions, Connection, PublicKey } from "@solana/web3.js";
import { CelebDuelProgramType, CelebDuelProgramIDL } from "./types";
import { AccountFetcher } from "./fetcher";
import { Methods } from "./methods";
/**
 * @category Core
 */
export class Context {
  readonly connection: Connection;
  readonly wallet: Wallet;
  readonly opts: ConfirmOptions;
  readonly program: Program<CelebDuelProgramType>;
  readonly provider: AnchorProvider;
  readonly fetcher: AccountFetcher;
  readonly methods: Methods;

  public static from(
    connection: Connection,
    wallet: Wallet,
    programId: PublicKey,
    fetcher = new AccountFetcher(connection),
    opts: ConfirmOptions = AnchorProvider.defaultOptions(),
  ): Context {
    const anchorProvider = new AnchorProvider(connection, wallet, opts);
    const program = new Program(CelebDuelProgramIDL, programId, anchorProvider);
    return new Context(anchorProvider, anchorProvider.wallet, program, fetcher, opts);
  }

  public static fromWorkspace(
    provider: AnchorProvider,
    program: Program,
    fetcher = new AccountFetcher(provider.connection),
    opts: ConfirmOptions = AnchorProvider.defaultOptions(),
  ) {
    return new Context(provider, provider.wallet, program, fetcher, opts);
  }

  public static withProvider(
    provider: AnchorProvider,
    programId: PublicKey,
    fetcher = new AccountFetcher(provider.connection),
    opts: ConfirmOptions = AnchorProvider.defaultOptions(),
  ): Context {
    const program = new Program(CelebDuelProgramIDL, programId, provider);
    return new Context(provider, provider.wallet, program, fetcher, opts);
  }

  public constructor(
    provider: AnchorProvider,
    wallet: Wallet,
    program: Program,
    fetcher: AccountFetcher,
    opts: ConfirmOptions,
  ) {
    this.connection = provider.connection;
    this.wallet = wallet;
    this.opts = opts;
    // It's a hack but it works on Anchor workspace *shrug*
    this.program = program as unknown as Program<CelebDuelProgramType>;
    this.provider = provider;
    this.fetcher = fetcher;
    this.methods = new Methods(this);
  }
}
