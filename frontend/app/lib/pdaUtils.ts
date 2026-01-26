import { PublicKey } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export const MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export function derivePDAs(
  creator: PublicKey,
  programId: PublicKey
): {
  curveConfig: PublicKey;
  mint: PublicKey;
  curveAta: PublicKey;
  metadata: PublicKey;
} {
  // Derive curve config PDA
  const [curveConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding-pump"), creator.toBuffer()],
    programId
  );

  // Derive mint PDA
  const [mint] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding-pump-mint"), creator.toBuffer()],
    programId
  );

  // Derive curve ATA
  const [curveAta] = PublicKey.findProgramAddressSync(
    [curveConfig.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // Derive metadata PDA
  const [metadata] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    MPL_TOKEN_METADATA_PROGRAM_ID
  );

  return {
    curveConfig,
    mint,
    curveAta,
    metadata,
  };
}

export function deriveUserATA(
  user: PublicKey,
  mint: PublicKey
): PublicKey {
  const [ata] = PublicKey.findProgramAddressSync(
    [user.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return ata;
}
