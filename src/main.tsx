import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ONECHAIN_TESTNET } from './config/network'
import './index.css'
import '@mysten/dapp-kit/dist/index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

// Configure network for OneChain
const networks = {
  [ONECHAIN_TESTNET.id]: {
    url: ONECHAIN_TESTNET.rpcUrl,
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork={ONECHAIN_TESTNET.id}>
        <WalletProvider autoConnect>
          <App />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </StrictMode>,
)
