# 🎉 Ninja Rush - OneChain Deployment Summary

## ✅ Deployment Successful!

**Date:** November 16, 2025  
**Network:** OneChain Testnet  
**Transaction Digest:** `4FgNy9UhuNKQoJgF4G1jGMVxfJ3uKcnYAg9rWoqeSbWj`

---

## 📦 Package Information

**Package ID:** `0x5db6460e1da7c97ff6e0fc282eb056727de3601f4fd01fd57f2bc7f2e85a0110`

**Modules Deployed:**
1. `ninja_token` - NINJA token with TreasuryCap
2. `token_exchange` - Milestone-based NINJA → OCT exchange
3. `leaderboard` - Global and daily leaderboards

---

## 🔗 Shared Object IDs

These shared objects are automatically created during deployment and must be referenced in transactions:

| Object | ID |
|--------|-----|
| **NinjaTokenState** | `0xb5530cdf9b5f7d795d559a6c7535a43cd0ca4e06868c78c11c103a8b276e984f` |
| **ExchangeTreasury** | `0xb16a497fb305766df42a6be8de09c94ced54ab646d36ca7465b735fe18bf038f` |
| **GlobalLeaderboard** | `0xc69fe74b958583f529af5a2f37f683252691a6850ff30aa15476b5ed6c02e8f1` |

---

## 💰 Gas Costs

- **Storage Cost:** 55.882800 MIST
- **Computation Cost:** 1.000000 MIST  
- **Total Cost:** ~0.056 OCT

---

## 🔑 Wallet Information

**Deployer Address:** `0xcb9d4e65cfa1183d5b3bfe43dfbcb68f7e3e0054d760a81e7ba38eab3661c08b`  
**Recovery Phrase:** `ribbon today error tower loop input sunny mention super wisdom alley shadow`

⚠️ **IMPORTANT:** Store the recovery phrase securely! This is needed to access the admin wallet.

---

## 📝 Contract Features

### 1. NINJA Token (`ninja_token.move`)
- **Token Standard:** Sui Coin with 6 decimals
- **Symbol:** NINJA
- **Features:**
  - Mint tokens based on game score (1 score = 1 NINJA)
  - Track player statistics (total_earned, games_played, last_claim)
  - Burn functionality for exchange

### 2. Token Exchange (`token_exchange.move`)
- **Milestones:**
  - 🥉 Bronze: 100 NINJA → 5 OCT
  - 🥈 Silver: 300 NINJA → 15 OCT
  - 🥇 Gold: 1000 NINJA → 50 OCT
- **Anti-double-claim:** Each milestone can only be claimed once per player
- **Treasury Management:** Admin can fund with OCT

### 3. Leaderboard (`leaderboard.move`)
- **Global Leaderboard:** Top 100 all-time scores
- **Daily Leaderboard:** Top 50 daily scores (resets every epoch ~24hrs)
- **Player Stats:** Tracks best_score, total_games, total_kills, total_powerups

---

## 🚀 Next Steps

### To Use the Contracts:

1. **Award NINJA Tokens:**
   ```bash
   one client call \
     --package 0x5db6460e1da7c97ff6e0fc282eb056727de3601f4fd01fd57f2bc7f2e85a0110 \
     --module ninja_token \
     --function award_tokens \
     --args 0xb5530cdf9b5f7d795d559a6c7535a43cd0ca4e06868c78c11c103a8b276e984f <PLAYER_ADDRESS> <SCORE> \
     --gas-budget 10000000
   ```

2. **Fund Exchange Treasury:**
   ```bash
   one client call \
     --package 0x5db6460e1da7c97ff6e0fc282eb056727de3601f4fd01fd57f2bc7f2e85a0110 \
     --module token_exchange \
     --function fund_treasury \
     --args 0xb16a497fb305766df42a6be8de09c94ced54ab646d36ca7465b735fe18bf038f <OCT_COIN_ID> \
     --gas-budget 10000000
   ```

3. **Submit Score to Leaderboard:**
   ```bash
   one client call \
     --package 0x5db6460e1da7c97ff6e0fc282eb056727de3601f4fd01fd57f2bc7f2e85a0110 \
     --module leaderboard \
     --function submit_score \
     --args 0xc69fe74b958583f529af5a2f37f683252691a6850ff30aa15476b5ed6c02e8f1 <SCORE> <ENEMIES_KILLED> <POWERUPS> \
     --gas-budget 10000000
   ```

### Frontend Integration Required:

The React app currently uses **Aptos SDK** but needs to be updated for **Sui Move**:

1. Replace `@aptos-labs/ts-sdk` with Sui SDK
2. Update `WalletContext.tsx` to use Programmable Transaction Blocks (PTBs)
3. Update transaction building for Sui's object model
4. Replace wallet adapter with OneWallet integration

---

## 🔗 Useful Links

- **OneChain Testnet RPC:** https://rpc-testnet.onelabs.cc:443
- **Faucet:** https://faucet-testnet.onelabs.cc/v1/gas
- **Chain ID:** 433

---

## 📊 Deployment Status

| Component | Status |
|-----------|--------|
| Smart Contracts | ✅ Deployed |
| NINJA Token | ✅ Live |
| Exchange Treasury | ✅ Created (needs OCT funding) |
| Leaderboard | ✅ Active |
| React Integration | ⏳ Needs Update |

---

**Built for OneChain Hackathon** 🥷💎
