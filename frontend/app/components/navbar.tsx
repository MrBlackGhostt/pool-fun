"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="border-b bg-card/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Pump.fun Clone
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/tokens"
              className="text-sm font-medium hover:text-purple-600 transition-colors"
            >
              All Tokens
            </Link>
            <Link
              href="/my-tokens"
              className="text-sm font-medium hover:text-purple-600 transition-colors"
            >
              My Tokens
            </Link>
            <Link href="/token-form">
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Launch Token
              </Button>
            </Link>
          </div>

          {/* Wallet Button */}
          <div className="flex items-center gap-4">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </nav>
  );
}

