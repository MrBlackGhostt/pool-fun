import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PumpClone } from "../target/types/pump_clone";
import { assert } from "chai";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

describe("pump-clone", () => {
  // Configure the client to use the local cluster.
  let provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.pumpClone as Program<PumpClone>;

  let creator = new anchor.web3.Keypair();
  let user = new anchor.web3.Keypair();

  // Hardcoded admin pubkey (matches ADMIN_PUBKEY constant in buy.rs)
  const adminPubkey = new anchor.web3.PublicKey(
    "Ex4xuNjnbmL7sbaM18WrgAMEv3LqurNQ379bUpWS4Xj3"
  );
  let name = "Pool";
  let name2 = "Pool2";

  // Derive mint PDAs FIRST (using creator + name)
  let mintSeed = [
    Buffer.from("bonding-pump-mint"),
    creator.publicKey.toBuffer(),
    Buffer.from(name, "utf-8"),
  ];
  let mintSeed2 = [
    Buffer.from("bonding-pump-mint"),
    creator.publicKey.toBuffer(),
    Buffer.from(name2, "utf-8"),
  ];

  let [mintPdaPubkey, mintBump] = anchor.web3.PublicKey.findProgramAddressSync(
    mintSeed,
    program.programId
  );
  let [mintPdaPubkey2, mintBump2] =
    anchor.web3.PublicKey.findProgramAddressSync(
      mintSeed2,
      program.programId
    );

  // Derive curve config PDAs SECOND (using mint pubkey)
  let curveSeed = [Buffer.from("bonding-pump"), mintPdaPubkey.toBuffer()];
  let curveSeed2 = [Buffer.from("bonding-pump"), mintPdaPubkey2.toBuffer()];

  let [curveConfigPdaPubkey, curveBump] =
    anchor.web3.PublicKey.findProgramAddressSync(curveSeed, program.programId);
  let [curveConfigPdaPubkey2, curveBump2] =
    anchor.web3.PublicKey.findProgramAddressSync(curveSeed2, program.programId);

  const MPL_TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );
  console.log("The mint pda pubkey", mintPdaPubkey.toBase58());
  let [metadata] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintPdaPubkey.toBuffer(),
    ],
    MPL_TOKEN_METADATA_PROGRAM_ID
  );

  const creator_token_account = getAssociatedTokenAddressSync(
    mintPdaPubkey,
    creator.publicKey
  );
  const curveAta = getAssociatedTokenAddressSync(
    mintPdaPubkey,
    curveConfigPdaPubkey,
    true
  );

  console.log("The metadata", metadata.toBase58());
  before("initialize airdrop", async () => {
    // Fund accounts using the provider wallet
    // Reduced amounts for testing
    const transaction = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: creator.publicKey,
        lamports: 0.1 * anchor.web3.LAMPORTS_PER_SOL,
      }),
      anchor.web3.SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: user.publicKey,
        lamports: 1 * anchor.web3.LAMPORTS_PER_SOL,
      }),
      anchor.web3.SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: adminPubkey,
        lamports: 0.1 * anchor.web3.LAMPORTS_PER_SOL,
      })
    );

    await provider.sendAndConfirm(transaction);

    const creatorInfo = await provider.connection.getAccountInfo(
      creator.publicKey
    );
    assert.equal(creatorInfo.lamports, 0.1 * anchor.web3.LAMPORTS_PER_SOL);
  });

  it("Is initialized!", async () => {
    // Add your test here.
    const name = "Pool";
    const symbol = "TEST";
    const uri =
      "https://th.bing.com/th/id/OIP.wtJFiv_9efEsP8qf8mrQ5gHaEK?w=291&h=181&c=7&r=0&o=7&pid=1.7&rm=3";

    const tx = await program.methods
      .initialize(name, symbol, uri)
      .accountsPartial({
        signer: creator.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadata: metadata,
        tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
      })
      .signers([creator])
      .rpc();
    console.log("Your transaction signature", tx);

    let curveConfigPdaInfo = await provider.connection.getAccountInfo(
      curveConfigPdaPubkey
    );
    assert.ok(curveConfigPdaInfo);

    const account = await program.account.curveConfiguration.fetch(
      curveConfigPdaPubkey
    );

    // Correct assertion: Check if the stored owner key equals the creator's key
    assert.ok(account.owner.equals(creator.publicKey));
  });
  it("Is initialized! Token 2", async () => {
    // Add your test here.
    const name = "Pool2";
    const symbol = "TEST";
    const uri =
      "https://th.bing.com/th/id/OIP.wtJFiv_9efEsP8qf8mrQ5gHaEK?w=291&h=181&c=7&r=0&o=7&pid=1.7&rm=3";

    // Derive metadata for second token
    let [metadata2] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintPdaPubkey2.toBuffer(),
      ],
      MPL_TOKEN_METADATA_PROGRAM_ID
    );

    const tx = await program.methods
      .initialize(name, symbol, uri)
      .accountsPartial({
        signer: creator.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadata: metadata2,
        tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
      })
      .signers([creator])
      .rpc();
    console.log("Your transaction signature", tx);

    let curveConfigPdaInfo2 = await provider.connection.getAccountInfo(
      curveConfigPdaPubkey2
    );
    assert.ok(curveConfigPdaInfo2);

    const account = await program.account.curveConfiguration.fetch(
      curveConfigPdaPubkey2
    );

    // Correct assertion: Check if the stored owner key equals the creator's key
    assert.ok(account.owner.equals(creator.publicKey));
  });
  it("buy", async () => {
    let amount = new anchor.BN(4);
    const user_token_account = getAssociatedTokenAddressSync(
      mintPdaPubkey,
      user.publicKey
    );

    const curveAta = getAssociatedTokenAddressSync(
      mintPdaPubkey,
      curveConfigPdaPubkey,
      true
    );
    const tx = await program.methods
      .buyToken(name, amount, new anchor.BN(1))
      .accountsPartial({
        curveConfig: curveConfigPdaPubkey,
        mint: mintPdaPubkey,
        curveAta: curveAta,
        userAta: user_token_account,
        mintCreator: creator.publicKey,
        user: user.publicKey,
        admin: adminPubkey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();
    console.log("Your transaction signature", tx);
    await provider.connection.confirmTransaction(tx);

    const user_ata_balance = await provider.connection.getTokenAccountBalance(
      user_token_account
    );
    console.log("user ata balance", user_ata_balance);
    assert.isAbove(Number(user_ata_balance.value.amount), 0);
  });

  it("reject buy with slipage protection", async () => {
    let amount = new anchor.BN(4);
    let min_token_amount = new anchor.BN(9999999999999);
    const user_token_account = getAssociatedTokenAddressSync(
      mintPdaPubkey,
      user.publicKey
    );

    const curveAta = getAssociatedTokenAddressSync(
      mintPdaPubkey,
      curveConfigPdaPubkey,
      true
    );
    try {
      const tx = await program.methods
        .buyToken(name, amount, min_token_amount)
        .accountsPartial({
          curveConfig: curveConfigPdaPubkey,
          mint: mintPdaPubkey,
          curveAta: curveAta,
          userAta: user_token_account,
          mintCreator: creator.publicKey,
          user: user.publicKey,
          admin: adminPubkey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();
      assert.fail("Should have thrown SlippageExceeded error");
    } catch (err) {
      assert.include(err.toString(), "SlippageExceeded");
    }
  });

  it("verify admin receives fee", async () => {
    let amount_in = new anchor.BN(100);

    let admin_bal_before = await provider.connection.getBalance(adminPubkey);

    console.log("admin key", adminPubkey.toBase58());
    console.log(
      "the Balance of admin before",
      admin_bal_before / anchor.web3.LAMPORTS_PER_SOL
    );
    // Define these INSIDE this test
    const user_token_account = getAssociatedTokenAddressSync(
      mintPdaPubkey,
      user.publicKey
    );
    const curveAta = getAssociatedTokenAddressSync(
      mintPdaPubkey,
      curveConfigPdaPubkey,
      true
    );
    const tx = await program.methods
      .buyToken(name, amount_in, new anchor.BN(1))
      .accountsPartial({
        curveConfig: curveConfigPdaPubkey,
        mint: mintPdaPubkey,
        curveAta: curveAta,
        userAta: user_token_account,
        mintCreator: creator.publicKey,
        user: user.publicKey,
        admin: adminPubkey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    await provider.connection.confirmTransaction(tx);

    let adminBalAfter = await provider.connection.getBalance(adminPubkey);

    console.log(
      "the Balance of admin After",
      adminBalAfter / anchor.web3.LAMPORTS_PER_SOL
    );

    let feeReceived = adminBalAfter - admin_bal_before;

    assert.equal(feeReceived, 1, "Admin balance increase by one");
  });

  it("sell", async () => {
    const user_token_account = getAssociatedTokenAddressSync(
      mintPdaPubkey,
      user.publicKey
    );
    //how it know whihc mint and token to look
    let balanceBefore = await provider.connection.getTokenAccountBalance(
      user_token_account
    );

    const sellAmount = new anchor.BN(balanceBefore.value.amount);

    const curveAta = getAssociatedTokenAddressSync(
      mintPdaPubkey,
      curveConfigPdaPubkey,
      true
    );
    const tx = await program.methods
      .sellToken(name, sellAmount, new anchor.BN(1))
      .accountsPartial({
        curveConfig: curveConfigPdaPubkey,
        mint: mintPdaPubkey,
        curveAta: curveAta,
        userAta: user_token_account,
        mintCreator: creator.publicKey,
        user: user.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();
    console.log("Your Sell transaction signature", tx);
    await provider.connection.confirmTransaction(tx);

    const user_ata_balance = await provider.connection.getTokenAccountBalance(
      user_token_account
    );
    console.log("use bal after", user_ata_balance.value.amount);
    assert.equal(Number(user_ata_balance.value.amount), 0);
  });

  // SKIPPED ON DEVNET: Requires 90 SOL which exceeds faucet limits
  // Graduation feature tested successfully on localnet
  it.skip("graduate curve by buying 90 SOL", async () => {
    // Note: On devnet with limited SOL, we skip this test
    // In production or localnet, this would use 90 SOL to reach the 85 SOL threshold
    const bigAmount = new anchor.BN(90 * anchor.web3.LAMPORTS_PER_SOL);

    const user_token_account = getAssociatedTokenAddressSync(
      mintPdaPubkey,
      user.publicKey
    );

    const curveAta = getAssociatedTokenAddressSync(
      mintPdaPubkey,
      curveConfigPdaPubkey,
      true
    );

    const tx = await program.methods
      .buyToken(name, bigAmount, new anchor.BN(1)) // Added min_token_out parameter!
      .accountsPartial({
        curveConfig: curveConfigPdaPubkey,
        mint: mintPdaPubkey,
        curveAta: curveAta,
        userAta: user_token_account,
        mintCreator: creator.publicKey,
        user: user.publicKey,
        admin: adminPubkey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    await provider.connection.confirmTransaction(tx);

    const curveState = await program.account.curveConfiguration.fetch(
      curveConfigPdaPubkey
    );
    assert.isTrue(curveState.isGraduated, "Curve should be graduated");
    console.log("🎓 Curve graduated successfully!");
  });

  // SKIPPED ON DEVNET: Requires graduation which needs 90 SOL
  // Withdrawal feature tested successfully on localnet
  it.skip("withdraw", async () => {
    const createAtaIx = createAssociatedTokenAccountInstruction(
      creator.publicKey, // payer
      creator_token_account, // ata
      creator.publicKey, // owner
      mintPdaPubkey // mint
    );

    try {
      const tx = new anchor.web3.Transaction().add(createAtaIx);
      await provider.sendAndConfirm(tx, [creator]);
      console.log("Created creator ATA");
    } catch (err) {
      console.log("ATA already exists, continuing...");
    }

    const curve_token = await provider.connection.getTokenAccountBalance(
      curveAta
    );
    console.log("curveal before", curve_token.value.amount);
    const tx = await program.methods
      .withdraw(name)
      .accountsPartial({
        mintCreator: creator.publicKey,
        curveConfig: curveConfigPdaPubkey,
        mint: mintPdaPubkey,
        mintCreatorAta: creator_token_account,
        curveAta: curveAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([creator])
      .rpc();
    await provider.connection.confirmTransaction(tx);

    const curve_token_after = await provider.connection.getTokenAccountBalance(
      curveAta
    );

    assert.equal(Number(curve_token_after.value.amount), 0);
  });
});
