import { getFullnodeUrl } from '@mysten/sui/client';

// OneChain Testnet Configuration
export const ONECHAIN_TESTNET = {
  id: 'onechain:testnet',
  name: 'OneChain Testnet',
  network: 'testnet',
  rpcUrl: 'https://rpc-testnet.onelabs.cc:443',
} as const;

// Contract addresses from deployment
export const CONTRACT_CONFIG = {
  packageId: import.meta.env.VITE_CONTRACT_ADDRESS || '0x5db6460e1da7c97ff6e0fc282eb056727de3601f4fd01fd57f2bc7f2e85a0110',
  ninjaTokenState: import.meta.env.VITE_NINJA_TOKEN_STATE || '0xb5530cdf9b5f7d795d559a6c7535a43cd0ca4e06868c78c11c103a8b276e984f',
  exchangeTreasury: import.meta.env.VITE_EXCHANGE_TREASURY || '0xb16a497fb305766df42a6be8de09c94ced54ab646d36ca7465b735fe18bf038f',
  globalLeaderboard: import.meta.env.VITE_GLOBAL_LEADERBOARD || '0xc69fe74b958583f529af5a2f37f683252691a6850ff30aa15476b5ed6c02e8f1',
} as const;

// Milestone configurations matching contract
export const MILESTONES = {
  BRONZE: { threshold: 100, reward: 5, id: 1 },
  SILVER: { threshold: 300, reward: 15, id: 2 },
  GOLD: { threshold: 1000, reward: 50, id: 3 },
} as const;
