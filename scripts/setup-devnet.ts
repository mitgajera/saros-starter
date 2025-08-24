#!/usr/bin/env ts-node

import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { SarosAMM } from '@saros-finance/sdk';
import { LiquidityBookServices, MODE } from '@saros-finance/dlmm-sdk';
import * as fs from 'fs';
import * as path from 'path';

interface SetupConfig {
  rpcUrl: string;
  network: string;
  airdropAmount: number;
  testTokens: string[];
  timeout: number;
}

interface SetupResult {
  success: boolean;
  walletAddress?: string;
  balance?: number;
  connectionStatus?: string;
  sdkStatus?: {
    amm: boolean;
    dlmm: boolean;
  };
  errors: string[];
  warnings: string[];
}

class DevnetSetup {
  private config: SetupConfig;
  private connection: Connection;
  private wallet: Keypair;
  private result: SetupResult;

  constructor() {
    this.config = {
      rpcUrl: 'https://api.devnet.solana.com',
      network: 'devnet',
      airdropAmount: 2, // SOL
      testTokens: ['SOL', 'USDC', 'C98'],
      timeout: 30000, // 30 seconds
    };

    this.connection = new Connection(this.config.rpcUrl, 'confirmed');
    this.wallet = Keypair.generate();
    this.result = {
      success: false,
      errors: [],
      warnings: [],
    };
  }

  async run(): Promise<SetupResult> {
    console.log('🚀 Starting Saros Devnet Setup...\n');

    try {
      // Step 1: Test connection
      await this.testConnection();

      // Step 2: Setup wallet
      await this.setupWallet();

      // Step 3: Test SDK connections
      await this.testSDKs();

      // Step 4: Validate environment
      await this.validateEnvironment();

      // Step 5: Generate configuration files
      await this.generateConfigFiles();

      this.result.success = true;
      console.log('\n✅ Devnet setup completed successfully!');
    } catch (error) {
      this.result.errors.push(`Setup failed: ${error}`);
      console.error('\n❌ Devnet setup failed:', error);
    }

    return this.result;
  }

  private async testConnection(): Promise<void> {
    console.log('🔌 Testing Solana connection...');
    
    try {
      const version = await this.connection.getVersion();
      const slot = await this.connection.getSlot();
      
      console.log(`   ✅ Connected to ${this.config.network}`);
      console.log(`   ✅ Solana version: ${version['solana-core']}`);
      console.log(`   ✅ Current slot: ${slot}`);
      
      this.result.connectionStatus = 'connected';
    } catch (error) {
      throw new Error(`Connection test failed: ${error}`);
    }
  }

  private async setupWallet(): Promise<void> {
    console.log('\n💰 Setting up test wallet...');
    
    try {
      // Request airdrop
      console.log(`   💸 Requesting ${this.config.airdropAmount} SOL airdrop...`);
      const signature = await this.connection.requestAirdrop(
        this.wallet.publicKey,
        this.config.airdropAmount * LAMPORTS_PER_SOL
      );
      
      // Wait for confirmation
      await this.connection.confirmTransaction(signature, 'confirmed');
      
      // Check balance
      const balance = await this.connection.getBalance(this.wallet.publicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      
      console.log(`   ✅ Wallet address: ${this.wallet.publicKey.toString()}`);
      console.log(`   ✅ Balance: ${solBalance.toFixed(4)} SOL`);
      
      this.result.walletAddress = this.wallet.publicKey.toString();
      this.result.balance = solBalance;
      
      if (solBalance < 1) {
        this.result.warnings.push('Low balance detected. Consider requesting another airdrop.');
      }
    } catch (error) {
      throw new Error(`Wallet setup failed: ${error}`);
    }
  }

  private async testSDKs(): Promise<void> {
    console.log('\n🔧 Testing Saros SDKs...');
    
    try {
      // Test AMM SDK
      console.log('   📊 Testing AMM SDK...');
      const ammSDK = new SarosAMM(this.connection, this.wallet);
      console.log('   ✅ AMM SDK initialized successfully');
      
      // Test DLMM SDK
      console.log('   🎯 Testing DLMM SDK...');
      const dlmmSDK = new LiquidityBookServices({ mode: MODE.DEVNET });
      console.log('   ✅ DLMM SDK initialized successfully');
      
      this.result.sdkStatus = {
        amm: true,
        dlmm: true,
      };
    } catch (error) {
      this.result.errors.push(`SDK test failed: ${error}`);
      console.log(`   ⚠️  SDK test warning: ${error}`);
    }
  }

  private async validateEnvironment(): Promise<void> {
    console.log('\n🔍 Validating environment...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 16) {
      this.result.warnings.push(`Node.js version ${nodeVersion} detected. Recommended: 16.x or higher.`);
    } else {
      console.log(`   ✅ Node.js version: ${nodeVersion}`);
    }
    
    // Check TypeScript
    try {
      require('typescript');
      console.log('   ✅ TypeScript available');
    } catch {
      this.result.warnings.push('TypeScript not found. Install with: npm install -g typescript');
    }
    
    // Check Solana CLI
    try {
      const { execSync } = require('child_process');
      const solanaVersion = execSync('solana --version', { encoding: 'utf8' });
      console.log(`   ✅ Solana CLI: ${solanaVersion.trim()}`);
    } catch {
      this.result.warnings.push('Solana CLI not found. Install from: https://docs.solana.com/cli/install-solana-cli-tools');
    }
  }

  private async generateConfigFiles(): Promise<void> {
    console.log('\n📝 Generating configuration files...');
    
    try {
      // Create .env file
      const envContent = `# Saros Devnet Configuration
SOLANA_RPC_URL=${this.config.rpcUrl}
SOLANA_NETWORK=${this.config.network}
WALLET_PRIVATE_KEY=${Buffer.from(this.wallet.secretKey).toString('base64')}
WALLET_PUBLIC_KEY=${this.wallet.publicKey.toString()}
AIRDROP_AMOUNT=${this.config.airdropAmount}
`;

      fs.writeFileSync('.env.devnet', envContent);
      console.log('   ✅ Created .env.devnet');
      
      // Create wallet keypair file
      const keypairContent = JSON.stringify(Array.from(this.wallet.secretKey));
      fs.writeFileSync('wallet-keypair.json', keypairContent);
      console.log('   ✅ Created wallet-keypair.json');
      
      // Create setup summary
      const summaryContent = `# Devnet Setup Summary

Generated: ${new Date().toISOString()}
Network: ${this.config.network}
RPC URL: ${this.config.rpcUrl}

## Wallet Information
Public Key: ${this.wallet.publicKey.toString()}
Balance: ${this.result.balance} SOL

## SDK Status
- AMM SDK: ${this.result.sdkStatus?.amm ? '✅ Ready' : '❌ Failed'}
- DLMM SDK: ${this.result.sdkStatus?.dlmm ? '✅ Ready' : '❌ Failed'}

## Next Steps
1. Copy .env.devnet to .env for local development
2. Use wallet-keypair.json for testing (keep private in production)
3. Run examples: npm run example:amm-swap
4. Test on devnet before mainnet

## Warnings
${this.result.warnings.map(w => `- ${w}`).join('\n')}

## Errors
${this.result.errors.map(e => `- ${e}`).join('\n')}
`;

      fs.writeFileSync('SETUP_SUMMARY.md', summaryContent);
      console.log('   ✅ Created SETUP_SUMMARY.md');
      
    } catch (error) {
      this.result.warnings.push(`Config file generation warning: ${error}`);
    }
  }

  // Utility methods
  getWallet(): Keypair {
    return this.wallet;
  }

  getConnection(): Connection {
    return this.connection;
  }

  getConfig(): SetupConfig {
    return this.config;
  }
}

// CLI execution
async function main() {
  const setup = new DevnetSetup();
  
  try {
    const result = await setup.run();
    
    console.log('\n📋 Setup Summary:');
    console.log(`   Success: ${result.success ? '✅ Yes' : '❌ No'}`);
    console.log(`   Wallet: ${result.walletAddress || 'N/A'}`);
    console.log(`   Balance: ${result.balance || 'N/A'} SOL`);
    console.log(`   Connection: ${result.connectionStatus || 'N/A'}`);
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Review SETUP_SUMMARY.md for details');
    console.log('   2. Copy .env.devnet to .env for development');
    console.log('   3. Run examples: npm run example:amm-swap');
    console.log('   4. Test functionality before mainnet deployment');
    
  } catch (error) {
    console.error('❌ Setup execution failed:', error);
    process.exit(1);
  }
}

// Export for programmatic use
export { DevnetSetup, SetupConfig, SetupResult };

// Run if called directly
if (require.main === module) {
  main();
}



