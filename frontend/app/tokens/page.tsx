"use client";

import { useEffect, useState } from "react";
import { tokenStorage } from "../lib/tokenStorage";
import { TokenData } from "../types/token";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function TokensPage() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const allTokens = tokenStorage.getAllTokens();
    // Sort by creation date (newest first)
    const sorted = allTokens.sort((a, b) => b.createdAt - a.createdAt);
    setTokens(sorted);
    setFilteredTokens(sorted);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTokens(tokens);
    } else {
      const filtered = tokens.filter(
        (token) =>
          token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          token.mintAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTokens(filtered);
    }
  }, [searchTerm, tokens]);

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                All Tokens
              </h1>
              <p className="text-muted-foreground mt-2">
                Explore {tokens.length} tokens on the platform
              </p>
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Link href="/token-form">Launch Token</Link>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by name, symbol, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-4 pr-12 text-base"
            />
            <span className="absolute right-4 top-3 text-2xl">🔍</span>
          </div>
        </div>

        {/* Token Grid */}
        {filteredTokens.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-6xl mb-4">
                {searchTerm ? "🔍" : "🪙"}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? "No tokens found" : "No tokens yet"}
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchTerm
                  ? `No tokens match "${searchTerm}"`
                  : "Be the first to create a token!"}
              </p>
              {!searchTerm && (
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Link href="/token-form">Create First Token</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTokens.map((token) => (
              <Link
                key={token.mintAddress}
                href={`/token/${token.mintAddress}`}
              >
                <Card className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-500/50 group hover:scale-105">
                  <CardHeader className="space-y-4">
                    {/* Token Image */}
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={token.uri}
                        alt={token.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='64' text-anchor='middle' dy='.3em'%3E🪙%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>

                    {/* Token Info */}
                    <div>
                      <CardTitle className="text-xl truncate">{token.name}</CardTitle>
                      <CardDescription className="font-mono text-lg mt-1">
                        ${token.symbol}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Creator Badge */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">By</span>
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {token.creator.slice(0, 4)}...{token.creator.slice(-4)}
                      </code>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-2 rounded border border-green-500/30">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="text-sm font-bold text-green-600">Live</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-2 rounded border border-blue-500/30">
                        <p className="text-xs text-muted-foreground">Age</p>
                        <p className="text-sm font-bold text-blue-600">
                          {Math.floor(
                            (Date.now() - token.createdAt) / (1000 * 60 * 60 * 24)
                          )}
                          d
                        </p>
                      </div>
                    </div>

                    {/* Trade Button */}
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-blue-600 group-hover:text-white font-semibold"
                    >
                      Trade Now →
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
