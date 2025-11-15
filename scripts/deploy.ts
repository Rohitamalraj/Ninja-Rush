#!/usr/bin/env node

/**
 * Ninja Rush Smart Contract Deployment Script
 * Deploys NINJA token, exchange, and leaderboard contracts to OneChain testnet
 */

import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';
import * as fs from 'fs';
import * as path from 'path';

// OneChain Testnet Configuration
const ONECHAIN_TESTNET_URL = 'https://rpc-testnet.onelabs.cc:443';
const ONECHAIN_CHAIN_ID = 433;

// Configure Aptos SDK for OneChain
const config = new AptosConfig({
  fullnode: ONECHAIN_TESTNET_URL,
  network: Network.CUSTOM,
});
const aptos = new Aptos(config);

// Admin account (will be loaded from environment or created)
let adminAccount: Account;

/**
 * Load or create admin account
 */
async function setupAdminAccount() {
  const privateKeyHex = process.env.ADMIN_PRIVATE_KEY;
  
  if (privateKeyHex) {
    console.log('📋 Loading admin account from environment...');
    const privateKey = new Ed25519PrivateKey(privateKeyHex);
    adminAccount = Account.fromPrivateKey({ privateKey });
  } else {
    console.log('🔑 Creating new admin account...');
    adminAccount = Account.generate();
    console.log('⚠️  SAVE THIS PRIVATE KEY: [Generated - check deployment-info.json]');
    console.log('📬 Admin Address:', adminAccount.accountAddress.toString());
  }
  
  console.log('✅ Admin account ready:', adminAccount.accountAddress.toString());
}

/**
 * Fund admin account from faucet (if available)
 */
async function fundAdminAccount() {
  try {
    console.log('💰 Requesting testnet tokens from faucet...');
    // OneChain testnet faucet endpoint
    const response = await fetch('https://faucet-testnet.onelabs.cc/v1/gas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: adminAccount.accountAddress.toString() })
    });
    
    if (response.ok) {
      console.log('✅ Account funded successfully');
    } else {
      console.log('⚠️  Faucet request failed. Please fund manually:', adminAccount.accountAddress.toString());
      console.log('⚠️  Manual faucet: https://faucet-testnet.onelabs.cc/v1/gas');
    }
  } catch {
    console.log('⚠️  Could not reach faucet. Please fund manually:', adminAccount.accountAddress.toString());
  }
  
  // Wait for balance
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const balance = await aptos.getAccountAPTAmount({
    accountAddress: adminAccount.accountAddress,
  });
  console.log('💵 Current balance:', balance / 100000000, 'OCT');
}

/**
 * Compile Move modules
 */
async function compileContracts() {
  console.log('\n📦 Compiling Move contracts...');
  const { execSync } = await import('child_process');
  
  try {
    const contractsDir = path.join(process.cwd(), 'contracts');
    const aptosCmd = process.platform === 'win32' 
      ? path.join(process.cwd(), 'aptos.exe')
      : 'aptos';
    
    execSync(`"${aptosCmd}" move compile`, { 
      cwd: contractsDir,
      stdio: 'inherit'
    });
    console.log('✅ Contracts compiled successfully');
  } catch (error) {
    console.error('❌ Compilation failed:', error);
    throw error;
  }
}

/**
 * Deploy module to OneChain
 */
async function deployModule(moduleName: string) {
  console.log(`\n🚀 Deploying ${moduleName}...`);
  
  const contractsDir = path.join(process.cwd(), 'contracts');
  const buildDir = path.join(contractsDir, 'build', 'NinjaRush');
  
  // Read compiled bytecode
  const packageMetadata = fs.readFileSync(
    path.join(buildDir, 'package-metadata.bcs')
  );
  const moduleCode = fs.readFileSync(
    path.join(buildDir, 'bytecode_modules', `${moduleName}.mv`)
  );
  
  // Create publish transaction
  const transaction = await aptos.publishPackageTransaction({
    account: adminAccount.accountAddress,
    metadataBytes: packageMetadata,
    moduleBytecode: [moduleCode],
  });
  
  // Sign and submit
  const pendingTxn = await aptos.signAndSubmitTransaction({
    signer: adminAccount,
    transaction,
  });
  
  // Wait for confirmation
  const response = await aptos.waitForTransaction({
    transactionHash: pendingTxn.hash,
  });
  
  console.log(`✅ ${moduleName} deployed!`);
  console.log(`   Transaction: ${pendingTxn.hash}`);
  
  return response;
}

/**
 * Initialize NINJA token
 */
async function initializeNinjaToken() {
  console.log('\n🎮 Initializing NINJA token...');
  
  const transaction = await aptos.transaction.build.simple({
    sender: adminAccount.accountAddress,
    data: {
      function: `${adminAccount.accountAddress}::ninja_token::initialize`,
      functionArguments: [],
    },
  });
  
  const pendingTxn = await aptos.signAndSubmitTransaction({
    signer: adminAccount,
    transaction,
  });
  
  await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
  console.log('✅ NINJA token initialized');
}

/**
 * Initialize exchange system
 */
async function initializeExchange() {
  console.log('\n💱 Initializing exchange system...');
  
  const transaction = await aptos.transaction.build.simple({
    sender: adminAccount.accountAddress,
    data: {
      function: `${adminAccount.accountAddress}::token_exchange::initialize`,
      functionArguments: [],
    },
  });
  
  const pendingTxn = await aptos.signAndSubmitTransaction({
    signer: adminAccount,
    transaction,
  });
  
  await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
  console.log('✅ Exchange initialized');
}

/**
 * Fund treasury with OCT
 */
async function fundTreasury(amount: number) {
  console.log(`\n💰 Funding treasury with ${amount} OCT...`);
  
  const amountInOcto = amount * 100000000; // 8 decimals
  
  const transaction = await aptos.transaction.build.simple({
    sender: adminAccount.accountAddress,
    data: {
      function: `${adminAccount.accountAddress}::token_exchange::fund_treasury`,
      functionArguments: [amountInOcto],
    },
  });
  
  const pendingTxn = await aptos.signAndSubmitTransaction({
    signer: adminAccount,
    transaction,
  });
  
  await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
  console.log('✅ Treasury funded');
}

/**
 * Initialize leaderboard
 */
async function initializeLeaderboard() {
  console.log('\n🏆 Initializing leaderboard...');
  
  const transaction = await aptos.transaction.build.simple({
    sender: adminAccount.accountAddress,
    data: {
      function: `${adminAccount.accountAddress}::leaderboard::initialize`,
      functionArguments: [],
    },
  });
  
  const pendingTxn = await aptos.signAndSubmitTransaction({
    signer: adminAccount,
    transaction,
  });
  
  await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
  console.log('✅ Leaderboard initialized');
}

/**
 * Save deployment info
 */
function saveDeploymentInfo() {
  const info = {
    network: 'OneChain Testnet',
    chainId: ONECHAIN_CHAIN_ID,
    rpcUrl: ONECHAIN_TESTNET_URL,
    adminAddress: adminAccount.accountAddress.toString(),
    deployedAt: new Date().toISOString(),
    contracts: {
      ninjaToken: `${adminAccount.accountAddress}::ninja_token`,
      tokenExchange: `${adminAccount.accountAddress}::token_exchange`,
      leaderboard: `${adminAccount.accountAddress}::leaderboard`,
    },
  };
  
  const outputPath = path.join(process.cwd(), 'deployment-info.json');
  fs.writeFileSync(outputPath, JSON.stringify(info, null, 2));
  console.log('\n📄 Deployment info saved to deployment-info.json');
  console.log(JSON.stringify(info, null, 2));
}

/**
 * Main deployment flow
 */
async function main() {
  console.log('🎮 Ninja Rush Contract Deployment');
  console.log('==================================\n');
  
  try {
    // Setup
    await setupAdminAccount();
    await fundAdminAccount();
    
    // Compile
    await compileContracts();
    
    // Deploy modules
    await deployModule('ninja_token');
    await deployModule('token_exchange');
    await deployModule('leaderboard');
    
    // Initialize contracts
    await initializeNinjaToken();
    await initializeExchange();
    await initializeLeaderboard();
    
    // Fund treasury with 500 OCT
    await fundTreasury(500);
    
    // Save deployment info
    saveDeploymentInfo();
    
    console.log('\n✨ Deployment complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Update .env with VITE_CONTRACT_ADDRESS');
    console.log('2. Update WalletContext.tsx to use deployed contract addresses');
    console.log('3. Test wallet connection and token claiming');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run deployment
main();
