"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { tokenStorage } from "../lib/tokenStorage";
import { TokenData } from "../types/token";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function MyTokensPage() {
  const wallet = useWallet();
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wallet.publicKey) {
      const myTokens = tokenStorage.getTokensByCreator(wallet.publicKey.toBase58());
      setTokens(myTokens);
      setLoading(false);
    } else {
      setTokens([]);
      setLoading(false);
    }
  }, [wallet.publicKey]);

  if (!wallet.connected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to see your created tokens
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              My Tokens
            </h1>
            <p className="text-muted-foreground mt-2">
              Tokens you've created ({tokens.length})
            </p>
          </div>
          <Button
            asChild
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Link href="/token-form">Create New Token</Link>
          </Button>
        </div>

        {/* Token Grid */}
        {tokens.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-6xl mb-4">🪙</div>
              <h3 className="text-xl font-semibold mb-2">No tokens yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Create your first token to get started
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link href="/token-form">Launch Your First Token</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokens.map((token) => (
              <Link
                key={token.mintAddress}
                href={`/token/${token.mintAddress}`}
              >
                <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-purple-500/50 group">
                  <CardHeader className="space-y-4">
                    {/* Token Image */}
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={token.uri}
                        alt={token.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='64' text-anchor='middle' dy='.3em'%3E🪙%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>

                    {/* Token Info */}
                    <div>
                      <CardTitle className="text-xl">{token.name}</CardTitle>
                      <CardDescription className="font-mono text-lg mt-1">
                        ${token.symbol}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Mint Address */}
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Mint Address
                      </p>
                      <code className="text-xs font-mono break-all">
                        {token.mintAddress.slice(0, 8)}...
                        {token.mintAddress.slice(-8)}
                      </code>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Created</span>
                      <span>
                        {new Date(token.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* View Button */}
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-purple-600 group-hover:text-white"
                    >
                      View Details →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
