"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import { useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "../hooks/useProgram";
import { PublicKey, Keypair } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SYSVAR_RENT_PUBKEY, SystemProgram } from "@solana/web3.js";
import { tokenStorage } from "../lib/tokenStorage";
import { TokenData } from "../types/token";
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "../lib/pdaUtils";

export default function TokenLaunchPage() {
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    uri: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("url");

  const wallet = useWallet();
  const program = useProgram();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [txSignature, setTxSignature] = useState("");
  const [createdTokenData, setCreatedTokenData] = useState<{
    name: string;
    symbol: string;
    uri: string;
    mintAddress: string;
    curveConfigAddress: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setError("");
    setSuccess("");
    setTxSignature("");
    setLoading(true);
    try {
      // TODO 1: Check if wallet is connected
      if (!wallet.publicKey) {
        throw new Error("Please connect your wallet");
      }
      // TODO 2: Check if program is loaded
      if (!program) {
        throw new Error("Program not loaded. Please refresh the page.");
      }
      // TODO 3: Derive PDAs (curve_config and token_mint)
      const [curveConfigPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("bonding-pump"), wallet.publicKey.toBuffer()],
        program.programId,
      );
      const [mintPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("bonding-pump-mint"), wallet.publicKey.toBuffer()],
        program.programId,
      );

      const [curveAta] = PublicKey.findProgramAddressSync(
        [
          curveConfigPda.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          mintPda.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      // TODO 4: Derive metadata PDA (Metaplex)
      const MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
      );
      const [metadataPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintPda.toBuffer(),
        ],
        MPL_TOKEN_METADATA_PROGRAM_ID,
      );
      // TODO 5: Get the image URI (either from URL or uploaded file)
      const imageUri = formData.uri;

      if (uploadMethod === "file" && imageFile) {
        // For now, we'll just alert the user to use URL method
        // You can implement IPFS upload later
        throw new Error(
          "File upload not implemented yet. Please use Image URL method.",
        );
      }
      if (!imageUri) {
        throw new Error("Please provide an image URL");
      }
      console.log("Creating token with:", {
        name: formData.name,
        symbol: formData.symbol,
        uri: imageUri,
        curveConfigPda: curveConfigPda.toBase58(),
        mintPda: mintPda.toBase58(),
        metadataPda: metadataPda.toBase58(),
      });
      // TODO 6: Call the initialize instruction
      const tx = await program.methods
        .initialize(formData.name, formData.symbol, imageUri)
        .accounts({
          signer: wallet.publicKey,
          curveConfig: curveConfigPda,
          tokenMint: mintPda,
          curveAta: curveAta,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          metadata: metadataPda,
          rent: SYSVAR_RENT_PUBKEY,
          tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      console.log("Transaction signature:", tx);

      // Save token to localStorage
      const tokenData: TokenData = {
        name: formData.name,
        symbol: formData.symbol,
        uri: imageUri,
        mintAddress: mintPda.toBase58(),
        curveConfigAddress: curveConfigPda.toBase58(),
        creator: wallet.publicKey.toBase58(),
        createdAt: Date.now(),
        txSignature: tx,
      };
      tokenStorage.saveToken(tokenData);

      // TODO 7: Set success state
      setSuccess("Token created successfully!");
      setTxSignature(tx);
      setCreatedTokenData({
        name: formData.name,
        symbol: formData.symbol,
        uri: imageUri,
        mintAddress: mintPda.toBase58(),
        curveConfigAddress: curveConfigPda.toBase58(),
      });
      // TODO 8: Reset form (keep data for display, but clear inputs)
      // setFormData({ name: "", symbol: "", uri: "" });
      // setImagePreview("");
      // setImageFile(null);
    } catch (err: any) {
      console.error("Error creating token:", err);
      setError(err.message || "Failed to create token");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update preview if URL is changed
    if (name === "uri" && uploadMethod === "url") {
      setImagePreview(value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10">
      <Card className="w-full max-w-2xl shadow-2xl border-2 bg-card/95 backdrop-blur">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Launch Your Token
            </CardTitle>
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
          </div>
          <CardDescription className="text-base">
            Create your own token on Solana with bonding curve mechanics
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Token Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Token Name *
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., My Awesome Token"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                The full name of your token
              </p>
            </div>

            {/* Token Symbol */}
            <div className="space-y-2">
              <Label htmlFor="symbol" className="text-sm font-medium">
                Token Symbol *
              </Label>
              <Input
                id="symbol"
                name="symbol"
                placeholder="e.g., MAT"
                value={formData.symbol}
                onChange={handleInputChange}
                required
                className="h-11 uppercase"
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">
                Short ticker symbol (usually 3-5 characters)
              </p>
            </div>

            {/* Image/Metadata Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Token Image *</Label>

              <Tabs
                defaultValue="url"
                className="w-full"
                onValueChange={(v) => setUploadMethod(v as "url" | "file")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">Image URL</TabsTrigger>
                  <TabsTrigger value="file">Upload File</TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-2">
                  <Input
                    id="uri"
                    name="uri"
                    type="url"
                    placeholder="https://example.com/token-image.png"
                    value={formData.uri}
                    onChange={handleInputChange}
                    required={uploadMethod === "url"}
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the URL of your token image (IPFS, Arweave, or any
                    public URL)
                  </p>
                </TabsContent>

                <TabsContent value="file" className="space-y-2">
                  <div className="relative">
                    <Input
                      id="file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required={uploadMethod === "file"}
                      className="h-11 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload an image file (will be uploaded to IPFS)
                  </p>
                </TabsContent>
              </Tabs>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4 space-y-2">
                  <Label className="text-sm font-medium">Preview</Label>
                  <div className="relative w-32 h-32 rounded-lg border-2 border-border overflow-hidden bg-muted">
                    <img
                      src={imagePreview}
                      alt="Token preview"
                      className="w-full h-full object-cover"
                      onError={() => setImagePreview("")}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Token Economics Info */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2 border border-border">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span>📊</span> Bonding Curve Economics
              </h3>
              <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                <li>• Initial Supply: 1,000,000,000 tokens</li>
                <li>• Virtual SOL Reserve: 30 SOL</li>
                <li>• Virtual Token Reserve: 1,073,000,000 tokens</li>
                <li>• Graduation Threshold: 85 SOL market cap</li>
                <li>• Trading Fee: 1% on buys (sent to protocol)</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={loading || !wallet.connected}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg disabled:opacity-50"
            >
              {loading
                ? "Creating Token..."
                : wallet.connected
                  ? "Create Token"
                  : "Connect Wallet First"}
            </Button>

            {/* Disclaimer */}
            <p className="text-xs text-center text-muted-foreground">
              By creating a token, you agree that you are responsible for the
              token's content and comply with all applicable laws.
            </p>
          </form>

          {/* Success Message with Token Details */}
          {success && txSignature && createdTokenData && (
            <div className="mt-6 space-y-4">
              {/* Success Banner */}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-2xl">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-green-600 dark:text-green-400">
                      Token Created Successfully!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your token is now live on Solana
                    </p>
                  </div>
                </div>
              </div>

              {/* Token Details Card */}
              <Card className="border-2 border-purple-500/50 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🪙</span>
                    Token Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Token Identity */}
                  <div className="flex items-start gap-4">
                    {/* Token Image */}
                    <div className="relative w-24 h-24 rounded-xl border-2 border-border overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={createdTokenData.uri}
                        alt={createdTokenData.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' font-size='48' text-anchor='middle' dy='.3em'%3E🪙%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>

                    {/* Token Info */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Token Name
                        </p>
                        <p className="text-xl font-bold">
                          {createdTokenData.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Symbol</p>
                        <p className="text-lg font-mono font-bold text-purple-600 dark:text-purple-400">
                          ${createdTokenData.symbol}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border"></div>

                  {/* Addresses */}
                  <div className="space-y-3">
                    {/* Mint Address */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <span>🏷️</span> Mint Address
                      </p>
                      <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg border border-border">
                        <code className="text-xs font-mono flex-1 break-all">
                          {createdTokenData.mintAddress}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 flex-shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              createdTokenData.mintAddress
                            );
                          }}
                        >
                          📋
                        </Button>
                      </div>
                    </div>

                    {/* Curve Config Address */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <span>📈</span> Bonding Curve Address
                      </p>
                      <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg border border-border">
                        <code className="text-xs font-mono flex-1 break-all">
                          {createdTokenData.curveConfigAddress}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 flex-shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              createdTokenData.curveConfigAddress
                            );
                          }}
                        >
                          📋
                        </Button>
                      </div>
                    </div>

                    {/* Transaction Signature */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <span>🔗</span> Transaction Signature
                      </p>
                      <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg border border-border">
                        <code className="text-xs font-mono flex-1 break-all">
                          {txSignature}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 flex-shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(txSignature);
                          }}
                        >
                          📋
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border"></div>

                  {/* Bonding Curve Stats */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <span>📊</span> Initial Curve Configuration
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-3 rounded-lg border border-blue-500/30">
                        <p className="text-xs text-muted-foreground">
                          Virtual SOL
                        </p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          30 SOL
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-3 rounded-lg border border-purple-500/30">
                        <p className="text-xs text-muted-foreground">
                          Total Supply
                        </p>
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          1B Tokens
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-3 rounded-lg border border-green-500/30">
                        <p className="text-xs text-muted-foreground">
                          Graduation
                        </p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          85 SOL
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 p-3 rounded-lg border border-orange-500/30">
                        <p className="text-xs text-muted-foreground">
                          Trading Fee
                        </p>
                        <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          1% on Buy
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border"></div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                    >
                      <a
                        href={`https://explorer.solana.com/address/${createdTokenData.mintAddress}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Token 🔍
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                    >
                      <a
                        href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Transaction 📜
                      </a>
                    </Button>
                  </div>

                  {/* Create Another Token Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={() => {
                      setSuccess("");
                      setTxSignature("");
                      setCreatedTokenData(null);
                      setFormData({ name: "", symbol: "", uri: "" });
                      setImagePreview("");
                      setImageFile(null);
                    }}
                  >
                    Create Another Token 🚀
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-500/10 border-2 border-red-500 text-red-600 dark:text-red-400 px-4 py-4 rounded-lg flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">⚠️</span>
              <div>
                <p className="font-semibold">Error Creating Token</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
