export {};

declare global {
  interface Window {
    aptos?: {
      connect: () => Promise<{ address: string; publicKey?: string }>;
      disconnect: () => Promise<void>;
      signAndSubmitTransaction: (payload: unknown) => Promise<{ hash: string }>;
      onAccountChange: (callback: (address: string | null) => void) => void;
      account: () => Promise<{ address: string; publicKey: string }>;
      network: () => Promise<string>;
    };
    walletContext?: {
      connected: boolean;
      address: string | null;
      balance: { ninja: number; oct: number };
      claimNinjaTokens: (score: number) => Promise<void>;
      exchangeForOCT: (milestone: number) => Promise<void>;
    };
  }
}
