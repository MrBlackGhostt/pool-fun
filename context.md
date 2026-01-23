# Learning Context: The 40-Day Sprint to Top 1% Solana Developer

**Date:** Fri Jan 23 2026
**Role:** Senior Developer / Apprentice
**Ultimate Goal:** Build production-grade Solana Infrastructure & Protocols to get hired by Helius, Anza, or Jito 
**Strategy:** One Masterpiece Project (Pump.fun Clone) evolved through every layer of the stack (Protocol -> Frontend -> Indexer -> Optimization).

**Core Directive:**
- **USER CODES, AI GUIDES.** Do not write the code for the user. Break problems into steps, ask guiding questions (Quiz), and force the user to drive the keyboard. Do not give any code until user ask for but if user ask without try dont show him if the concept new then help a little if not then do not give any code.
- **NO TUTORIAL HOPPING.** Every task must contribute to the active project.
- **STRICT STANDARDS.** Treat every PR like a job interview test (Tests, Safety Checks, Error Handling).

---

## 1. Mistake Log & Growth Areas (The "Weakness" Column)

_Tracks recurring errors to turn weaknesses into strengths. Review before every session._

| Date   | Category       | Mistake                                                                        | Fix Strategy                                                                                      |
| :----- | :------------- | :----------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| Jan 21 | **Signers**    | Adding seeds to Token Transfer (User -> Curve).                                | **Rule**: Only add `with_signer` when a *PDA* is the authority. Users sign for themselves.        |
| Jan 21 | **TS/PDA**     | Passing `PublicKey` directly to `findProgramAddress`.                          | **Rule**: Always use `.toBuffer()` for keys and `Buffer.from("str")` for strings in TS seeds.     |
| Jan 22 | **Deps**       | `constant_time_eq` (Edition 2024) broke build.                                 | **Fix**: Use `cargo update -p <pkg> --precise <ver>` to pin stable versions.                      |
| Jan 22 | **Anchor**     | Cryptic `create_type` errors.                                                  | **Rule**: Enable `idl-build` feature for `anchor-spl` in `Cargo.toml`.                            |
| Jan 22 | **SOL Trans**  | `system_program::transfer` from PDA failed.                                    | **Rule**: Use direct lamport manipulation (`sub_lamports` / `add_lamports`) for accounts you own. |
| Jan 22 | **Math**       | `u64 * u64` overflowed in bonding curve.                                       | **Rule**: Always cast to `u128` for intermediate AMM product calculations (`k`).                  |
| Jan 22 | **Testing**    | `requestAirdrop` failed with "Internal Error".                                 | **Fix**: Use `SystemProgram.transfer` from the pre-funded `provider.wallet` in tests.             |
| Jan 23 | **Test/Env**   | "Program not executable" (Metaplex).                                           | **Fix**: External programs aren't in `test-validator` by default. Load `.so` via `Anchor.toml`.   |
| Jan 23 | **Test/PDA**   | Metadata PDA mismatch (Error 0x5).                                             | **Rule**: Metadata PDAs are owned by Metaplex. Use `MPL_ID` to derive, not `programId`.           |
| Jan 23 | **Anchor**     | `expected 4 arguments, found 1` in `lib.rs`.                                   | **Rule**: When changing instruction args, update `lib.rs` wrapper function signature too.         |
| Jan 23 | **Math/Fee**   | Used `amount_in * 100 / 100` for 1% fee (calculated 100% instead of 1%).       | **Rule**: For 1%, use `amount_in / 100`. Order of operations: left-to-right for `*` and `/`.      |
| Jan 23 | **Logic**      | Deducted fee AFTER curve math instead of BEFORE.                               | **Rule**: Deduct & transfer fees FIRST (fail-fast). Then do curve math with remaining amount.     |
| Jan 23 | **Solana/Acc** | Thought hardcoded `Pubkey` constant would auto-load the account.               | **Rule**: ALL accounts must be passed by client. Constants are VALIDATORS, not loaders.           |
| Jan 23 | **Test/Scope** | Used variables (`curveAta`, `user_ata`) from different test scope.             | **Rule**: Each test is isolated. Define required variables inside each test block.                |
| Jan 23 | **Test/Debug** | Checked balance of NEW admin keypair but sent fees to OLD hardcoded address.   | **Fix**: Ensure test passes same admin pubkey used in balance assertions. Print keys to debug.    |
| Jan 23 | **Integer**    | Didn't consider integer division rounding (50 lamports / 100 = 0 fee).         | **Decision**: Accept 0% fee for trades < 100 lamports (user acquisition strategy).                |


---

## 2. The 40-Day Production Roadmap (Zero to Hired)

**Current Status:** Phase 1 (Protocol) - Fee Switch Complete.

### Phase 1: The Protocol Engineer (Smart Contract Depth)
*Focus: Security, Math, Business Logic.*

- [x] **Core Engine**: Init, Buy, Sell (Constant Product AMM).
- [x] **Day 1: Identity (Metadata)**: Integrate Metaplex to give tokens Names/Symbols/Images.
- [x] **Day 2: Economics (Fee Switch)**: Implement 1% admin fee on trades (Basis points math).
- [ ] **Day 3: Migration (The Graduation)**: Lock trading at 85 SOL cap and "withdraw" liquidity (Simulating Raydium seeding).
- [ ] **Day 4: Security**: Add Slippage protection (`min_out`) and proper Error handling.

### Phase 2: The Full-Stack Engineer (Integration & SDKs)
*Focus: Usability, Typescript, React.*

- [ ] **Day 5-6: TypeScript SDK**: Refactor tests into a clean `PumpClient` class.
- [ ] **Day 7-9: The Frontend**: Next.js UI. Connect Wallet -> Create Coin (IPFS) -> Buy/Sell Chart.

### Phase 3: The Infrastructure Engineer (Data & Speed)
*Focus: Indexing, Events, Databases.*

- [ ] **Day 10-11: Event Emitter**: Emit Anchor `Events` (`TradeEvent`, `CurveComplete`).
- [ ] **Day 12-14: The Indexer**: Write a script to listen to events and save to a DB (SQLite). *Connects to Geyser knowledge.*

### Phase 4: The Systems Engineer (Optimization & MEV)
*Focus: Performance, Low-level Rust.*

- [ ] **Day 15-16: CU Optimization**: Profile the `buy` instruction. Reduce Compute Units used.
- [ ] **Day 17-18: The Sniper**: Write a bot to detect `initialize` and buy in the same block.

---

## 3. Active Project: "Pump.fun Clone"

**Directory:** `pump-clone/`
**Tech Stack:** Anchor 0.30+, Solana 1.18+, TypeScript.

### Completed Features:
- `CurveConfiguration` State (Efficient Space).
- `initialize`: Creates Mint + Vault (PDA) + **Metadata**.
- `buy`: SOL -> Curve, Tokens -> User (Math: `k=x*y`, `u128` safe) + **1% Admin Fee**.
- `sell`: Tokens -> Curve, SOL -> User (No fee - strategic decision).
- **Tests**: Full lifecycle verification (Init + Meta -> Buy + Fee Collection -> Sell).

### Next Action:
**Implement The Graduation (Migration).**
- **Why:** To simulate token "graduating" to Raydium at market cap milestone.
- **How:** Lock trading when virtual SOL reserve hits 85 SOL. Prepare liquidity for DEX migration.
