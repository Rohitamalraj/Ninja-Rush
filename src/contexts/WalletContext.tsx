import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { CONTRACT_CONFIG, MILESTONES } from '../config/network';

interface WalletContextType {
  connected: boolean;
  address: string | null;
  balance: {
    ninja: number;
    oct: number;
  };
  connecting: boolean;
  claimNinjaTokens: (score: number) => Promise<void>;
  exchangeForOCT: (milestone: number) => Promise<void>;
  submitScore: (score: number, enemiesKilled: number, powerUpsCollected: number) => Promise<void>;
  getLeaderboard: () => Promise<any[]>;
  refreshBalance: () => Promise<void>;
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

const ONECHAIN_TESTNET_CONFIG = {
  id: 'onechain-testnet',
  name: 'OneChain Testnet',
  rpc: 'https://rpc-testnet.onelabs.cc:443',
  chainId: '1bd5c965',
};

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  
  const [balance, setBalance] = useState({ ninja: 0, oct: 0 });
  const [connecting] = useState(false);

  const connected = !!currentAccount;
  const address = currentAccount?.address || null;

  // Check and switch to OneChain Testnet when wallet connects
  useEffect(() => {
    const ensureCorrectNetwork = async () => {
      if (!connected) return;

      try {
        // Check current chain
        const currentChainId = await suiClient.getChainIdentifier();
        
        if (currentChainId !== ONECHAIN_TESTNET_CONFIG.chainId) {
          console.log('Wrong network detected. Attempting to add/switch to OneChain Testnet...');
          
          // Try to add the network via wallet_addChain (EIP-3085 style)
          try {
            // @ts-expect-error - Using wallet API
            if (window.oneWallet) {
              // @ts-expect-error - OneWallet API
              await window.oneWallet.request({
                method: 'wallet_addChain',
                params: [{
                  chainId: ONECHAIN_TESTNET_CONFIG.chainId,
                  chainName: ONECHAIN_TESTNET_CONFIG.name,
                  rpcUrls: [ONECHAIN_TESTNET_CONFIG.rpc],
                  nativeCurrency: {
                    name: 'OCT',
                    symbol: 'OCT',
                    decimals: 9,
                  },
                }],
              });
              console.log('Successfully added OneChain Testnet to wallet');
            } else {
              console.warn('OneWallet API not available. Please manually add OneChain Testnet.');
              console.log('Network config:', ONECHAIN_TESTNET_CONFIG);
            }
          } catch (addError) {
            // Network might already exist, try to switch
            const error = addError as { code?: number; message?: string };
            if (error?.code === 4902) {
              console.log('Network already exists, attempting to switch...');
            } else {
              console.error('Failed to add network:', addError);
            }
          }
        } else {
          console.log('Already connected to OneChain Testnet');
        }
      } catch (error) {
        console.error('Failed to check/switch network:', error);
      }
    };

    ensureCorrectNetwork();
  }, [connected, suiClient]);

  // Fetch NINJA token balance
  const refreshBalance = useCallback(async () => {
    if (!address) return;

    try {
      // Get all coin objects owned by the user
      const { data: coins } = await suiClient.getAllCoins({
        owner: address,
      });

      // Find NINJA tokens (will have type like 0x{packageId}::ninja_token::NINJA_TOKEN)
      const ninjaCoins = coins.filter(coin => 
        coin.coinType.includes('ninja_token::NINJA_TOKEN')
      );

      const ninjaBalance = ninjaCoins.reduce((sum, coin) => sum + BigInt(coin.balance), BigInt(0));

      // Get OCT balance (native coin)
      const octCoins = coins.filter(coin => 
        coin.coinType.includes('oct::OCT') || coin.coinType === '0x2::sui::SUI'
      );

      const octBalance = octCoins.reduce((sum, coin) => sum + BigInt(coin.balance), BigInt(0));

      setBalance({
        ninja: Number(ninjaBalance) / 1_000_000, // 6 decimals
        oct: Number(octBalance) / 1_000_000_000, // 9 decimals (MIST)
      });
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    }
  }, [address, suiClient]);

  // Award NINJA tokens based on game score
  const claimNinjaTokens = useCallback(async (score: number) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log('Building transaction to claim', score, 'NINJA tokens');
      console.log('Contract config:', CONTRACT_CONFIG);
      console.log('Player address:', address);
      
      const tx = new Transaction();

      // Set gas budget
      tx.setGasBudget(10000000); // 0.01 OCT

      // Call award_tokens function
      tx.moveCall({
        target: `${CONTRACT_CONFIG.packageId}::ninja_token::award_tokens`,
        arguments: [
          tx.object(CONTRACT_CONFIG.ninjaTokenState), // NinjaTokenState shared object
          tx.pure.address(address), // player address (bcs encoded)
          tx.pure.u64(score), // score amount (bcs encoded)
        ],
      });

      console.log('Transaction built successfully');
      console.log('Sending to wallet for signing...');
      
      const result = await signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('Transaction successful:', result);
          },
        }
      );

      console.log('NINJA tokens claimed!', result);
      console.log('Transaction Digest:', result.digest);
      console.log('View on Explorer: https://onescan.cc/testnet/transactionBlocksDetail?digest=' + result.digest);
      
      // Refresh balance after transaction
      await refreshBalance();
      
      return result.digest;
    } catch (error) {
      console.error('Failed to claim NINJA tokens:', error);
      
      // Provide helpful error messages
      if (error instanceof Error) {
        if (error.message.includes('No valid gas coins') || error.message.includes('Insufficient gas')) {
          throw new Error('Insufficient OCT for gas fees. Please get testnet OCT from the faucet to pay for transactions.');
        }
        if (error.message.includes('endpoints failed') || error.message.includes('fetch')) {
          throw new Error('Network error: Unable to connect to OneChain. Please verify OneWallet is connected to OneChain Testnet (RPC: https://rpc-testnet.onelabs.cc:443)');
        }
        if (error.message.includes('Rejected') || error.message.includes('User rejected')) {
          throw new Error('Transaction was rejected');
        }
      }
      
      throw error;
    }
  }, [address, signAndExecuteTransaction, refreshBalance]);

  // Exchange NINJA tokens for OCT at milestone
  const exchangeForOCT = useCallback(async (milestoneId: number) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      // Get milestone config
      const milestone = Object.values(MILESTONES).find(m => m.id === milestoneId);
      if (!milestone) {
        throw new Error('Invalid milestone');
      }

      // Get user's NINJA coins
      const { data: coins } = await suiClient.getAllCoins({
        owner: address,
      });

      const ninjaCoins = coins.filter(coin => 
        coin.coinType.includes('ninja_token::NINJA_TOKEN')
      );

      if (ninjaCoins.length === 0) {
        throw new Error('No NINJA tokens found');
      }

      const tx = new Transaction();

      // Set gas budget
      tx.setGasBudget(10000000); // 0.01 OCT

      // Merge all NINJA coins if multiple
      const ninjaCoin = tx.object(ninjaCoins[0].coinObjectId);
      if (ninjaCoins.length > 1) {
        tx.mergeCoins(
          ninjaCoin,
          ninjaCoins.slice(1).map(c => tx.object(c.coinObjectId))
        );
      }

      // Split the required amount for milestone
      const requiredAmount = milestone.threshold * 1_000_000; // 6 decimals
      const [paymentCoin] = tx.splitCoins(ninjaCoin, [tx.pure.u64(requiredAmount)]);

      // Call exchange_at_milestone
      tx.moveCall({
        target: `${CONTRACT_CONFIG.packageId}::token_exchange::exchange_at_milestone`,
        arguments: [
          tx.object(CONTRACT_CONFIG.exchangeTreasury), // ExchangeTreasury shared object
          tx.object(CONTRACT_CONFIG.ninjaTokenState), // NinjaTokenState shared object
          paymentCoin, // Coin<NINJA_TOKEN> payment
          tx.pure.u8(milestoneId), // milestone ID
        ],
      });

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      console.log(`Exchanged for OCT at milestone ${milestoneId}!`, result);
      
      // Refresh balance
      await refreshBalance();
    } catch (error) {
      console.error('Failed to exchange tokens:', error);
      throw error;
    }
  }, [address, suiClient, signAndExecuteTransaction, refreshBalance]);

  // Submit score to leaderboard
  const submitScore = useCallback(async (
    score: number, 
    enemiesKilled: number, 
    powerUpsCollected: number
  ) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = new Transaction();

      // Set gas budget
      tx.setGasBudget(10000000); // 0.01 OCT

      // Call submit_score function
      tx.moveCall({
        target: `${CONTRACT_CONFIG.packageId}::leaderboard::submit_score`,
        arguments: [
          tx.object(CONTRACT_CONFIG.globalLeaderboard), // GlobalLeaderboard shared object
          tx.pure.u64(score),
          tx.pure.u64(enemiesKilled),
          tx.pure.u64(powerUpsCollected),
        ],
      });

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      console.log('Score submitted to leaderboard!', result);
    } catch (error) {
      console.error('Failed to submit score:', error);
      throw error;
    }
  }, [address, signAndExecuteTransaction]);

  // Get leaderboard entries
  const getLeaderboard = useCallback(async () => {
    try {
      console.log('Fetching leaderboard from:', CONTRACT_CONFIG.globalLeaderboard);
      
      // Get the GlobalLeaderboard object
      const leaderboardObject = await suiClient.getObject({
        id: CONTRACT_CONFIG.globalLeaderboard,
        options: {
          showContent: true,
        },
      });

      console.log('Leaderboard object:', leaderboardObject);

      if (leaderboardObject.data?.content?.dataType === 'moveObject') {
        const fields = (leaderboardObject.data.content as any).fields;
        console.log('Leaderboard fields:', fields);
        console.log('Top scores:', fields.top_scores);
        console.log('Daily scores:', fields.daily_scores);
        
        // The leaderboard has top_scores as an array
        const topScores = fields.top_scores || [];
        
        if (topScores.length > 0) {
          const entries = topScores.map((scoreEntry: any) => {
            return {
              player: scoreEntry.fields?.player || scoreEntry.player,
              score: parseInt(scoreEntry.fields?.score || scoreEntry.score),
              enemiesKilled: parseInt(scoreEntry.fields?.enemies_killed || scoreEntry.enemies_killed || 0),
              powerUpsCollected: parseInt(scoreEntry.fields?.power_ups_collected || scoreEntry.power_ups_collected || 0),
              timestamp: parseInt(scoreEntry.fields?.timestamp || scoreEntry.timestamp || Date.now()),
            };
          });
          
          console.log('Parsed leaderboard entries:', entries);
          return entries;
        }
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      return [];
    }
  }, [suiClient]);

  // Refresh balance when account changes
  useEffect(() => {
    if (connected && address) {
      refreshBalance();
    } else {
      setBalance({ ninja: 0, oct: 0 });
    }
  }, [connected, address, refreshBalance]);

  const value: WalletContextType = {
    connected,
    address,
    balance,
    connecting,
    claimNinjaTokens,
    exchangeForOCT,
    submitScore,
    getLeaderboard,
    refreshBalance,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
