import { start } from "solana-bankrun";
import { PublicKey, Transaction, SystemProgram, Keypair } from "@solana/web3.js";
import { WarpTransactionExecutor } from "../transactions/warp-transaction-executor";
import { JitoTransactionExecutor } from "../transactions/jito-rpc-transaction-executor";
import { DefaultTransactionExecutor } from "../transactions/default-transaction-executor";

describe("Solana Transaction Executors", () => {
  let context: any;
  let client: any;
  let payer: Keypair;
  let receiver: PublicKey;
  let blockhash: string;
  const warpFee = "1000"; // Example fee
  const jitoFee = "1000"; // Example fee

  beforeAll(async () => {
    context = await start([], []);
    client = context.banksClient;
    payer = context.payer;
    receiver = Keypair.generate().publicKey; // Generate a new receiver keypair
    blockhash = context.lastBlockhash;
  });

  afterAll(async () => {
    await context.close(); // Close the bankrun context
  });

  test("WarpTransactionExecutor should execute and confirm a transaction", async () => {
    const warpExecutor = new WarpTransactionExecutor(warpFee);
    const transferLamports = 1_000_000n;

    const ixs = [
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: receiver,
        lamports: transferLamports,
      }),
    ];
    const tx = new Transaction();
    tx.recentBlockhash = blockhash;
    tx.add(...ixs);
    tx.sign(payer);

    const result = await warpExecutor.executeAndConfirm(tx, payer, { blockhash, lastValidBlockHeight: context.lastBlockhash });
    expect(result.confirmed).toBe(true);
  });

  test("JitoTransactionExecutor should execute and confirm a transaction", async () => {
    const jitoExecutor = new JitoTransactionExecutor(jitoFee, context.connection);
    const transferLamports = 1_000_000n;

    const ixs = [
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: receiver,
        lamports: transferLamports,
      }),
    ];
    const tx = new Transaction();
    tx.recentBlockhash = blockhash;
    tx.add(...ixs);
    tx.sign(payer);

    const result = await jitoExecutor.executeAndConfirm(tx, payer, { blockhash, lastValidBlockHeight: context.lastBlockhash });
    expect(result.confirmed).toBe(true);
  });

  test("DefaultTransactionExecutor should execute and confirm a transaction", async () => {
    const defaultExecutor = new DefaultTransactionExecutor(context.connection);
    const transferLamports = 1_000_000n;

    const ixs = [
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: receiver,
        lamports: transferLamports,
      }),
    ];
    const tx = new Transaction();
    tx.recentBlockhash = blockhash;
    tx.add(...ixs);
    tx.sign(payer);

    const result = await defaultExecutor.executeAndConfirm(tx, payer, { blockhash, lastValidBlockHeight: context.lastBlockhash });
    expect(result.confirmed).toBe(true);
  });
}); 