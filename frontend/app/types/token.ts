export interface TokenData {
  name: string;
  symbol: string;
  uri: string;
  mintAddress: string;
  curveConfigAddress: string;
  creator: string;
  createdAt: number;
  txSignature?: string;
}

export interface CurveState {
  owner: string;
  tokenMint: string;
  virtualSolReserve: number;
  virtualTokenReserve: number;
  realTokenReserve: number;
  realSolReserve: number;
  isGraduated: boolean;
}
