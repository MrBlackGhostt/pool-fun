# Learning Context: The Road to Top 1% Solana Developer

**Date:** Tue Jan 20 2026
**Role:** Senior Developer / Apprentice
**Ultimate Goal:** Build production-grade Solana Infrastructure & Protocols to get hired by Helius, Anza, or Jito. you are a super seniour helpfull solana and rust developer which is like top 1% developer in solana and rust. you see the check on internet and use best practice to help the user to learn and guide him.
Do not do the code user will do the code as user want to learn not you so guide him best way
Break the problem in small steps and guide the user to do it step by step and connect the dots and increase the difficulty level step by step so not stuck at basic level the user
- do not code the user will code the user have to learn not you 
- ask the user quiz and que and trick que like why to do that why not this or that 
- ask the user to do the code step by step and guide him to do it
- also when the session start ask user and like using the flashcard 
- also made a session of mistake or weakness and made the collection in the context.md file and update it so user can use it for future reference and work on them 
- also pick the next task connect to prev knowledge and guide the user to do it step by step and connect the dots and increase the difficulty level step by step so not stuck at basic level the user.
## 1. Current Status: The Pivot

- **Completed:** Geyser Plugin Basics (File I/O, Filtering, Serialization, Decoding).
- **Paused:** Geyser Networking/gRPC (Parked to focus on Core Protocol skills first).
- **Active Project:** **"Pump.fun Clone" (Bonding Curve Launchpad)**.

## 2. Mistake Log & Growth Areas (The "Weakness" Column)

_This section tracks recurring errors to turn weaknesses into strengths._

| Date   | Mistake                                                                        | Lesson Learned                                                      | Fix Strategy                                                                                      |
| :----- | :----------------------------------------------------------------------------- | :------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------ |
| Jan 19 | **Performance**: Storing `String` in hot path struct.                          | `Pubkey` (32 bytes) is 100x faster to compare than `String`.        | Always parse config strings into efficient types (`Pubkey`, `u64`) during `on_load`.              |
| Jan 20 | **Types**: `FakePubkey.as_ref()` reference to temporary value.                 | Rust drops the temporary `as_ref()` slice immediately.              | Store the owned data (e.g., `.to_bytes()`) in a variable before taking a reference to it.         |
| Jan 20 | **Architecture**: Massive `update_account` function.                           | Hard to test/maintain.                                              | **Refactoring**: Split logic into `should_log` (pure logic) and `write_entry` (I/O).              |
| Jan 20 | **Process**: Jumping between projects (Geyser -> Staking -> Orca -> Pump.fun). | Context switching kills momentum.                                   | **Commitment**: Finish "Bonding Curve" Phase 0 before pivoting again.                             |
| Jan 20 | **Planning**: Initializing folders before defining architecture.               | Wasted setup time (`staking-contract`, `simplified-orca`).          | **Design First**: Define Structs & Math in `LEARNING_CONTEXT.md` before running `anchor init`.    |
| Jan 20 | **Context**: Ignoring completed prerequisites.                                 | Attempted "Option 1" (Geyser Basics) despite already completing it. | **Review Context**: Always check "Current Status" in `LEARNING_CONTEXT.md` before picking a task. |
| Jan 21 | **Modules**: Confused why `pub mod instructions` is needed in `lib.rs`.        | `mod.rs` makes a folder a module, but `lib.rs` must declare it.     | **Rule**: Always declare top-level modules in `lib.rs` with `pub mod name;`.                      |
| Jan 21 | **Anchor**: "Trait Bound Bumps not satisfied" error.                           | Missing `token_program` when using `InterfaceAccount`.              | **Rule**: If using `InterfaceAccount` (Mint/Token), always include `token_program`.               |

## 3. The Master Roadmap (0 to 1%)

### Phase 0: The Foundation (Anchor & State) [ACTIVE]

_Goal: Prove mastery of State, Time, and PDAs without AMM complexity._

- [ ] **Theory**: Deep dive into Account Model (Files + Rent) & Unix Timestamp.
- [ ] **Project: Bonding Curve Launchpad (Pump.fun Clone)**
  - [ ] **Pre-requisites**: Study Bonding Curve Math, Token Metadata, & Security.
  - [ ] `initialize_curve`: Create Mint (PDA) + Curve State.
  - [ ] `buy(amount)`: Accept SOL -> Calc Output -> Mint/Transfer Tokens.
  - [ ] `sell(amount)`: Accept Tokens -> Burn/Transfer -> Return SOL.
  - [ ] **Math**: Implement Linear or Exponential bonding curve.

### Phase 1: AccountsDB & Data Layout

_Goal: Understand how validators actually store data._

- [ ] Study `mmap` and AccountsDB internals (Anza blog).
- [ ] **Project: Rebuild Orca (Simplified)**:
  - [ ] Swap logic & LP Accounts.
  - [ ] Blog Post: "Common Anchor Pitfalls".

### Phase 2: Indexing & Geyser (Infrastructure Path)

_Goal: Production-grade data streaming._

- [x] **Geyser Basics**: File I/O, Filtering, Decoding (Completed in `geyser-basic`).
- [ ] **Yellowstone gRPC**: Fork & run the industry standard.
- [ ] **Project: Real-time Indexer**: Validator -> Geyser -> ClickHouse.
- [ ] **Deliverable**: "Indexing Solana Efficiently" (Technical Post).

### Phase 3: The Engine (DeFi & Performance)

_Goal: Low-level optimization for high-frequency environments._

- [ ] **DeFi Mechanics**: Study Phoenix (Orderbook) vs AMM math.
- [ ] **Systems Perf**: Profile Rust code with `perf` / `flamegraph`.
- [ ] **Project: CU Optimization**: Reduce CU usage of an existing program.
- [ ] **MEV**: Study Jito bundles and scheduler.

## 4. Project History

### A. Geyser Basic (Completed)

- **Repo**: `geyser-basic`
- **Concepts**:
  - `on_load`: Config parsing.
  - `update_account`: The hot loop.
  - `Pubkey` vs `String` performance.
  - `Mutex` for safe shared file access.
  - `spl-token` decoding (raw bytes -> Struct).
- **Outcome**: Functional plugin running in `solana-test-validator`.

## 5. Next Actions

1.  Study **Bonding Curve Math** (Linear vs Exponential).
2.  Research **Token Metadata** (Metaplex/UMI) integration.
3.  Initialize new project folder: `bonding-curve`.
