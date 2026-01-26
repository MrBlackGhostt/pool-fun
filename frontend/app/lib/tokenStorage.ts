import { TokenData } from "../types/token";

const STORAGE_KEY = "created_tokens";

export const tokenStorage = {
  // Save a newly created token
  saveToken: (token: TokenData): void => {
    try {
      const tokens = tokenStorage.getAllTokens();
      tokens.push(token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error("Failed to save token:", error);
    }
  },

  // Get all tokens
  getAllTokens: (): TokenData[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load tokens:", error);
      return [];
    }
  },

  // Get tokens created by a specific wallet
  getTokensByCreator: (creator: string): TokenData[] => {
    const allTokens = tokenStorage.getAllTokens();
    return allTokens.filter((token) => token.creator === creator);
  },

  // Get a specific token by mint address
  getTokenByMint: (mintAddress: string): TokenData | null => {
    const allTokens = tokenStorage.getAllTokens();
    return allTokens.find((token) => token.mintAddress === mintAddress) || null;
  },

  // Clear all tokens (for testing)
  clearAll: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },
};
