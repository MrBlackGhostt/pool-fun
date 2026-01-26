"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useProgram } from "../../hooks/useProgram";
import { tokenStorage } from "../../lib/tokenStorage";
import { TokenData, CurveState } from "../../types/token";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deriveUserATA } from "../../lib/pdaUtils";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
} from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";
import Link from "next/link";

export default function TokenDetailPage() {
  const params = useParams();
  const mintAddress = params?.mint as string;
  const wallet = useWallet();
  const { connection } = useConnection();
  const program = useProgram();

  const [token, setToken] = useState<TokenData | null>(null);
  const [curveState, setCurveState] = useState<CurveState | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Buy/Sell states
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load token data
  useEffect(() => {
    const loadTokenData = async () => {
      try {
        setLoading(true);
        const tokenData = tokenStorage.getTokenByMint(mintAddress);
        setToken(tokenData);

        if (!tokenData || !program) {
          setLoading(false);
          return;
        }

        // Fetch curve state from blockchain
        const curveConfigPda = new PublicKey(tokenData.curveConfigAddress);
        const curveAccount = await program.account.curveConfiguration.fetch(
          curveConfigPda
        );

        setCurveState({
          owner: curveAccount.owner.toBase58(),
          tokenMint: curveAccount.tokenMint.toBase58(),
          virtualSolReserve: curveAccount.virtualSolReserve.toNumber(),
          virtualTokenReserve: curveAccount.virtualTokenReserve.toNumber(),
          realTokenReserve: curveAccount.realTokenReserve.toNumber(),
          realSolReserve: curveAccount.realSolReserve.toNumber(),
          isGraduated: curveAccount.isGraduated,
        });

        // Fetch user balance if wallet connected
        if (wallet.publicKey) {
          try {
            const userAta = deriveUserATA(
              wallet.publicKey,
              new PublicKey(mintAddress)
            );
            const accountInfo = await getAccount(connection, userAta);
            setUserBalance(Number(accountInfo.amount) / 1e9);
          } catch (err) {
            setUserBalance(0);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading token:", err);
        setLoading(false);
      }
    };

    if (mintAddress && program) {
      loadTokenData();
    }
  }, [mintAddress, program, wallet.publicKey]);

  // Buy function
  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBuyLoading(true);

    try {
      if (!wallet.publicKey || !program || !token) {
        throw new Error("Wallet not connected or program not loaded");
      }

      const solAmount = parseFloat(buyAmount);
      if (isNaN(solAmount) || solAmount <= 0) {
        throw new Error("Invalid amount");
      }

      const mintPda = new PublicKey(mintAddress);
      const curveConfigPda = new PublicKey(token.curveConfigAddress);
      const creatorPubkey = new PublicKey(token.creator);
      const adminPubkey = new PublicKey("Ex4xuNjnbmL7sbaM18WrgAMEv3LqurNQ379bUpWS4Xj3");

      const [curveAta] = PublicKey.findProgramAddressSync(
        [curveConfigPda.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintPda.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const userAta = deriveUserATA(wallet.publicKey, mintPda);

      const tx = await program.methods
        .buyToken(
          new BN(solAmount * LAMPORTS_PER_SOL),
          new BN(0) // min_token_out (slippage protection)
        )
        .accounts({
          user: wallet.publicKey,
          mintCreator: creatorPubkey,
          admin: adminPubkey,
          curveConfig: curveConfigPda,
          mint: mintPda,
          curveAta: curveAta,
          userAta: userAta,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setSuccess(`Bought successfully! TX: ${tx.slice(0, 8)}...`);
      setBuyAmount("");
      
      // Refresh data
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      console.error("Buy error:", err);
      setError(err.message || "Failed to buy tokens");
    } finally {
      setBuyLoading(false);
    }
  };

  // Sell function
  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSellLoading(true);

    try {
      if (!wallet.publicKey || !program || !token) {
        throw new Error("Wallet not connected or program not loaded");
      }

      const tokenAmount = parseFloat(sellAmount);
      if (isNaN(tokenAmount) || tokenAmount <= 0) {
        throw new Error("Invalid amount");
      }

      const mintPda = new PublicKey(mintAddress);
      const curveConfigPda = new PublicKey(token.curveConfigAddress);
      const creatorPubkey = new PublicKey(token.creator);

      const [curveAta] = PublicKey.findProgramAddressSync(
        [curveConfigPda.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintPda.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const userAta = deriveUserATA(wallet.publicKey, mintPda);

      const tx = await program.methods
        .sellToken(
          new BN(tokenAmount * 1e9),
          new BN(0) // min_sol_out (slippage protection)
        )
        .accounts({
          user: wallet.publicKey,
          mintCreator: creatorPubkey,
          curveConfig: curveConfigPda,
          mint: mintPda,
          curveAta: curveAta,
          userAta: userAta,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setSuccess(`Sold successfully! TX: ${tx.slice(0, 8)}...`);
      setSellAmount("");
      
      // Refresh data
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      console.error("Sell error:", err);
      setError(err.message || "Failed to sell tokens");
    } finally {
      setSellLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Token Not Found</CardTitle>
            <CardDescription>
              The token you're looking for doesn't exist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/tokens">Browse Tokens</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPrice = curveState
    ? (curveState.virtualSolReserve / curveState.virtualTokenReserve) * LAMPORTS_PER_SOL
    : 0;
  const marketCap = curveState
    ? (currentPrice * 1_000_000_000) / LAMPORTS_PER_SOL
    : 0;
  const progress = curveState
    ? (curveState.realSolReserve / (85 * LAMPORTS_PER_SOL)) * 100
    : 0;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/tokens">← Back</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Token Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <img
                    src={token.uri}
                    alt={token.name}
                    className="w-24 h-24 rounded-xl object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' font-size='48' text-anchor='middle' dy='.3em'%3E🪙%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="flex-1">
                    <CardTitle className="text-3xl">{token.name}</CardTitle>
                    <CardDescription className="text-xl font-mono mt-1">
                      ${token.symbol}
                    </CardDescription>
                    <div className="flex gap-2 mt-3">
                      <a
                        href={`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View on Explorer →
                      </a>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4 rounded-lg border border-blue-500/30">
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {currentPrice.toFixed(9)} SOL
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4 rounded-lg border border-purple-500/30">
                    <p className="text-sm text-muted-foreground">Market Cap</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {marketCap.toFixed(2)} SOL
                    </p>
                  </div>
                </div>

                {/* Progress to Graduation */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Bonding Curve Progress</span>
                    <span className="font-bold">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {curveState?.realSolReserve 
                      ? (curveState.realSolReserve / LAMPORTS_PER_SOL).toFixed(2) 
                      : 0}{" "}
                    / 85 SOL to graduation
                  </p>
                </div>

                {/* Creator */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Created by</p>
                  <code className="text-xs font-mono bg-muted px-3 py-2 rounded">
                    {token.creator}
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Trading */}
          <div className="space-y-6">
            {/* User Balance */}
            {wallet.connected && (
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-lg">Your Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">
                    {userBalance.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ${token.symbol} tokens
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Buy/Sell Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Trade</CardTitle>
              </CardHeader>
              <CardContent>
                {!wallet.connected ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Connect your wallet to trade
                    </p>
                  </div>
                ) : curveState?.isGraduated ? (
                  <div className="text-center py-8">
                    <p className="text-lg font-semibold mb-2">🎓 Graduated!</p>
                    <p className="text-sm text-muted-foreground">
                      This token has graduated to Raydium
                    </p>
                  </div>
                ) : (
                  <Tabs defaultValue="buy" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="buy">Buy</TabsTrigger>
                      <TabsTrigger value="sell">Sell</TabsTrigger>
                    </TabsList>

                    <TabsContent value="buy" className="space-y-4">
                      <form onSubmit={handleBuy} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="buy-amount">Amount (SOL)</Label>
                          <Input
                            id="buy-amount"
                            type="number"
                            step="0.01"
                            placeholder="0.0"
                            value={buyAmount}
                            onChange={(e) => setBuyAmount(e.target.value)}
                            required
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={buyLoading}
                        >
                          {buyLoading ? "Buying..." : "Buy Tokens"}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="sell" className="space-y-4">
                      <form onSubmit={handleSell} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="sell-amount">Amount (Tokens)</Label>
                          <Input
                            id="sell-amount"
                            type="number"
                            step="0.01"
                            placeholder="0.0"
                            value={sellAmount}
                            onChange={(e) => setSellAmount(e.target.value)}
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            Balance: {userBalance.toFixed(2)}
                          </p>
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-red-600 hover:bg-red-700"
                          disabled={sellLoading}
                        >
                          {sellLoading ? "Selling..." : "Sell Tokens"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                )}

                {/* Success/Error Messages */}
                {success && (
                  <div className="mt-4 bg-green-500/10 border border-green-500 text-green-600 px-3 py-2 rounded text-sm">
                    {success}
                  </div>
                )}
                {error && (
                  <div className="mt-4 bg-red-500/10 border border-red-500 text-red-600 px-3 py-2 rounded text-sm">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
