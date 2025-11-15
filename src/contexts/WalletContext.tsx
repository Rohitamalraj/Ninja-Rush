import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// OneChain testnet configuration
const ONECHAIN_TESTNET_URL = 'https://rpc-testnet.onelabs.cc:443';

// Contract addresses (will be updated after deployment)
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x1'; // Placeholder

// Initialize Aptos client for OneChain
const config = new AptosConfig({
  fullnode: ONECHAIN_TESTNET_URL,
  network: Network.CUSTOM,
});
const aptosClient = new Aptos(config);

interface WalletContextType {
  connected: boolean;
  address: string | null;
  balance: {
    ninja: number;
    oct: number;
  };
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signAndSubmitTransaction: (transaction: unknown) => Promise<unknown>;
  claimNinjaTokens: (score: number) => Promise<void>;
  exchangeForOCT: (milestone: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState({ ninja: 0, oct: 0 });
  const [connecting, setConnecting] = useState(false);

  const connect = async () => {
    setConnecting(true);
    try {
      // Check if OneWallet is installed
      if (!window.aptos) {
        alert('Please install OneWallet extension first!');
        window.open('https://www.onewallet.io/', '_blank');
        setConnecting(false);
        return;
      }

      // Request connection
      const response = await window.aptos.connect();
      
      if (response.address) {
        setAddress(response.address);
        setConnected(true);
        
        // Store in localStorage
        localStorage.setItem('walletAddress', response.address);
        
        // Fetch initial balances
        await updateBalances(response.address);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setConnected(false);
    setAddress(null);
    setBalance({ ninja: 0, oct: 0 });
    localStorage.removeItem('walletAddress');
  };

  const updateBalances = async (walletAddress: string) => {
    try {
      // Fetch NINJA token balance
      const ninjaBalance = await aptosClient.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::ninja_token::get_balance` as `${string}::${string}::${string}`,
          functionArguments: [walletAddress],
        },
      });
      
      // Fetch OCT balance (native token)
      const resources = await aptosClient.getAccountResources({
        accountAddress: walletAddress,
      });
      
      const octResource = resources.find(
        (r) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );
      
      const octBalance = octResource ? Number((octResource.data as { coin: { value: string } }).coin.value) : 0;
      
      setBalance({
        ninja: Number(ninjaBalance[0]) / 1000000, // 6 decimals
        oct: octBalance / 100000000, // 8 decimals
      });
    } catch (error) {
      console.error('Failed to update balances:', error);
      // Fallback to localStorage
      const ninjaBalance = parseInt(localStorage.getItem('ninjaBalance') || '0');
      const octBalance = parseInt(localStorage.getItem('octBalance') || '0');
      
      setBalance({
        ninja: ninjaBalance,
        oct: octBalance
      });
    }
  };

  const signAndSubmitTransaction = async (payload: unknown) => {
    if (!connected || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      if (!window.aptos) {
        throw new Error('Wallet not available');
      }

      const pendingTransaction = await window.aptos.signAndSubmitTransaction(payload);
      
      // Wait for transaction confirmation
      const txn = await aptosClient.waitForTransaction({
        transactionHash: pendingTransaction.hash,
      });
      
      // Update balances after transaction
      await updateBalances(address);
      
      return txn;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  // Claim NINJA tokens after game
  const claimNinjaTokens = async (score: number) => {
    if (!connected || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // Convert score to NINJA tokens (1:1 ratio)
      const ninjaAmount = score * 1000000; // 6 decimals

      const transaction = await aptosClient.transaction.build.simple({
        sender: address,
        data: {
          function: `${CONTRACT_ADDRESS}::ninja_token::award_tokens`,
          functionArguments: [address, ninjaAmount],
        },
      });

      await signAndSubmitTransaction(transaction);
      
      console.log(`Claimed ${score} NINJA tokens!`);
    } catch (error) {
      console.error('Failed to claim NINJA tokens:', error);
      throw error;
    }
  };

  // Exchange NINJA for OCT at milestone
  const exchangeForOCT = async (milestone: number) => {
    if (!connected || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      const transaction = await aptosClient.transaction.build.simple({
        sender: address,
        data: {
          function: `${CONTRACT_ADDRESS}::token_exchange::exchange_at_milestone`,
          functionArguments: [CONTRACT_ADDRESS, milestone],
        },
      });

      await signAndSubmitTransaction(transaction);
      
      console.log(`Exchanged NINJA for OCT at milestone ${milestone}!`);
    } catch (error) {
      console.error('Failed to exchange tokens:', error);
      throw error;
    }
  };

  // Auto-connect on mount if previously connected
  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress && window.aptos) {
      connect();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.aptos) {
      window.aptos.onAccountChange((newAddress: string | null) => {
        if (newAddress) {
          setAddress(newAddress);
          localStorage.setItem('walletAddress', newAddress);
          updateBalances(newAddress);
        } else {
          disconnect();
        }
      });
    }
  }, []);

  const value: WalletContextType = {
    connected,
    address,
    balance,
    connecting,
    connect,
    disconnect,
    signAndSubmitTransaction,
    claimNinjaTokens,
    exchangeForOCT,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
