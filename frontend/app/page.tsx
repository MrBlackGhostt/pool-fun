"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { tokenStorage } from "./lib/tokenStorage";

export default function Home() {
  const wallet = useWallet();
  const [stats, setStats] = useState({
    totalTokens: 0,
    recentTokens: [] as any[],
  });

  useEffect(() => {
    const allTokens = tokenStorage.getAllTokens();
    setStats({
      totalTokens: allTokens.length,
      recentTokens: allTokens.slice(0, 3),
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center space-y-8">
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Launch Tokens on
                <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  Solana in Seconds
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto">
                The fairest way to launch a token. No presale, no team allocation. 
                Just pure bonding curve mechanics.
              </p>
            </div>

            {/* CTA Buttons */}
            <TooltipProvider>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      size="lg"
                      className="text-lg px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      <Link href="/token-form">
                        🚀 Launch Your Token
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create your own token in 60 seconds</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      size="lg"
                      className="text-lg px-8 py-6 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      <Link href="/tokens">
                        📊 Browse Tokens
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Explore all launched tokens</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8">
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
                <div className="text-4xl font-bold">{stats.totalTokens}</div>
                <div className="text-purple-200 mt-2">Tokens Launched</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
                <div className="text-4xl font-bold">100%</div>
                <div className="text-purple-200 mt-2">Fair Launch</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
                <div className="text-4xl font-bold">0%</div>
                <div className="text-purple-200 mt-2">Platform Fee</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-muted-foreground">
              Built for creators, traders, and the community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-2 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-4">⚡</div>
                <CardTitle>Instant Launch</CardTitle>
                <CardDescription>
                  Create and deploy your token in less than 60 seconds. No coding required.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-4">📈</div>
                <CardTitle>Bonding Curve</CardTitle>
                <CardDescription>
                  Fair price discovery with automated market making. The more people buy, the higher the price.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:border-pink-500/50 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-4">🎓</div>
                <CardTitle>Auto Graduation</CardTitle>
                <CardDescription>
                  When your token reaches 85 SOL market cap, it automatically graduates to Raydium.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="border-2 hover:border-green-500/50 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-4">🔒</div>
                <CardTitle>Secure & Safe</CardTitle>
                <CardDescription>
                  Built on Solana with Anchor framework. Audited smart contracts ensure your funds are safe.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="border-2 hover:border-yellow-500/50 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-4">💰</div>
                <CardTitle>Low Fees</CardTitle>
                <CardDescription>
                  Only 1% fee on buys. No hidden charges. What you see is what you get.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="border-2 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-4">🌐</div>
                <CardTitle>Community First</CardTitle>
                <CardDescription>
                  No presale, no team tokens. 100% of supply goes to the bonding curve.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Launch your token in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-2xl font-bold">Create Token</h3>
              <p className="text-muted-foreground">
                Fill in your token name, symbol, and upload an image. That's it!
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-2xl font-bold">Share & Trade</h3>
              <p className="text-muted-foreground">
                Share your token with the community. Anyone can buy and sell instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-2xl font-bold">Graduate</h3>
              <p className="text-muted-foreground">
                Once you hit 85 SOL market cap, your token graduates to Raydium automatically!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Tokens */}
      {stats.recentTokens.length > 0 && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Recently Launched</h2>
              <Button asChild variant="outline">
                <Link href="/tokens">View All →</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.recentTokens.map((token) => (
                <Link key={token.mintAddress} href={`/token/${token.mintAddress}`}>
                  <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-purple-500/50">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <img
                          src={token.uri}
                          alt={token.name}
                          className="w-16 h-16 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23ddd' width='64' height='64'/%3E%3Ctext x='50%25' y='50%25' font-size='32' text-anchor='middle' dy='.3em'%3E🪙%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div>
                          <CardTitle className="text-lg">{token.name}</CardTitle>
                          <CardDescription className="font-mono">
                            ${token.symbol}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Launch Your Token?
          </h2>
          <p className="text-xl text-purple-100">
            Join thousands of creators who have already launched on Solana
          </p>
          <TooltipProvider>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    size="lg"
                    className="text-lg px-8 py-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all font-bold"
                  >
                    <Link href="/token-form">
                      🚀 Launch Now
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Start creating your token</p>
                </TooltipContent>
              </Tooltip>
              {!wallet.connected && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      size="lg"
                      className="text-lg px-8 py-6 bg-white/20 backdrop-blur border-2 border-white text-white hover:bg-white/30"
                    >
                      <Link href="/tokens">
                        Learn More
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>See how it works</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎱</span>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Pool.fun
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                The fairest token launcher on Solana. Built with Anchor & Next.js.
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                <a
                  href="https://x.com/HKsoldev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-purple-600 hover:text-white transition-colors"
                  title="Follow on X"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href="https://github.com/MrBlackGhostt/pool-fun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-purple-600 hover:text-white transition-colors"
                  title="View on GitHub"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/token-form" className="hover:text-foreground">Launch Token</Link></li>
                <li><Link href="/tokens" className="hover:text-foreground">Browse Tokens</Link></li>
                <li><Link href="/my-tokens" className="hover:text-foreground">My Tokens</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">Developer</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a 
                    href="https://x.com/HKsoldev" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-foreground flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    @HKsoldev
                  </a>
                </li>
                <li>
                  <a 
                    href="https://github.com/MrBlackGhostt/pool-fun" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-foreground flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                    </svg>
                    Source Code
                  </a>
                </li>
                <li>
                  <a 
                    href="https://github.com/MrBlackGhostt" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-foreground"
                  >
                    GitHub Profile
                  </a>
                </li>
              </ul>
            </div>

            {/* Tech Stack */}
            <div>
              <h4 className="font-semibold mb-4">Built With</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>⚡ Solana Blockchain</li>
                <li>⚓ Anchor Framework</li>
                <li>⚛️ Next.js + React</li>
                <li>🎨 Tailwind + shadcn/ui</li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground space-y-2">
            <p>
              Built by{" "}
              <a 
                href="https://x.com/HKsoldev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                @HKsoldev
              </a>
              {" "}• View{" "}
              <a 
                href="https://github.com/MrBlackGhostt/pool-fun" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Source Code
              </a>
            </p>
            <p>© 2024 Pool.fun. Built with ❤️ on Solana</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
