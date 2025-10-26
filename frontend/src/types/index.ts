import { ethers } from 'ethers';

// Contract Info Types
export interface ContractInfo {
  address: string;
  network: string;
  chainId: number;
  fhevmEnabled: boolean;
  minBet?: string;
  maxBet?: string;
  houseEdge?: string;
  balance?: string;
}

// Game Types
export interface GameResult {
  outcome: 'heads' | 'tails';
  won: boolean;
  payout: number;
}

export interface GameHistory {
  side: 'heads' | 'tails';
  amount: number;
  outcome: 'heads' | 'tails';
  won: boolean;
  payout: number;
  timestamp: string;
}

export interface GameStats {
  wins: number;
  losses: number;
  totalWagered: number;
}

// Wallet Types
export interface WalletState {
  connected: boolean;
  address: string;
  balance: string;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
}

// Error Types
export type ErrorType = 'wallet' | 'network' | 'contract' | 'transaction' | '';
export type SuccessType = 'win' | 'withdraw' | 'fund' | '';

// Window Ethereum Types
export interface WindowEthereum extends ethers.Eip1193Provider {
  on(event: 'accountsChanged', handler: (accounts: string[]) => void): void;
  on(event: 'chainChanged', handler: () => void): void;
  removeAllListeners(event: string): void;
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: WindowEthereum;
  }
}

// FHEVM Types
export interface FhevmInstance {
  createEncryptedInput(contractAddress: string, userAddress: string): unknown;
  encrypt_bool(value: boolean): Promise<unknown>;
  encrypt_uint8(value: number): Promise<unknown>;
  // Add other FHEVM methods as needed
}

// Component Props Types
export interface LastGameResult {
  won: boolean;
  amount: number;
  payout: number;
  choice: 'heads' | 'tails';
  result: 'heads' | 'tails';
  timestamp: string;
}

// Environment Variables
export interface ImportMetaEnv {
  VITE_CONTRACT_ADDRESS?: string;
  VITE_NETWORK?: string;
  VITE_CHAIN_ID?: string;
  VITE_RPC_URL?: string;
  VITE_FHEVM_GATEWAY_URL?: string;
}

interface ImportMeta {
  env: ImportMetaEnv;
}
