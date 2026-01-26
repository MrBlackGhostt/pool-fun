import { useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import idl from "../../idl/pool_fun.json";

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const program = useMemo(() => {
    if (
      !wallet.publicKey ||
      !wallet.signTransaction ||
      !wallet.signAllTransactions
    ) {
      return null;
    }
    const anchorWallet = {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction.bind(wallet),
      signAllTransactions: wallet.signAllTransactions.bind(wallet),
    };
    const provider = new AnchorProvider(
      connection,
      anchorWallet,
      AnchorProvider.defaultOptions(),
    );
    // Cast IDL to Idl type and create program
    return new Program(idl as Idl, provider);
  }, [connection, wallet]);
  return program;
}
