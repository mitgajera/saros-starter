#!/usr/bin/env ts-node

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { SarosAMM } from '@saros-finance/sdk';
import { LiquidityBookServices, MODE } from '@saros-finance/dlmm-sdk';
import * as fs from 'fs';
import * as readline from 'readline';

interface MainnetConfig {
  rpcUrl: string;
  network: string;
  minBalance: number; // Minimum SOL balance required
  timeout: number;
}

interface MainnetSetupResult {
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

class MainnetSetup {
  private config: MainnetConfig;
  private connection: Connection;
  private wallet: Keypair | null = null;
  private result: MainnetSetupResult;
  private rl: readline.Interface;

  constructor() {
    this.config = {
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      network: 'mainnet-beta',
      minBalance: 0.05, // Minimum 0.05 SOL
      timeout: 30000, // 30 seconds
    };

    this.connection = new Connection(this.config.rpcUrl, 'confirmed');
    this.result = {
      success: false,
      errors: [],
      warnings: [],
    };
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async run(): Promise<MainnetSetupResult> {
    console.log('🚀 Starting Saros Mainnet Setup...\n');
    console.log('⚠️  WARNING: This will configure your environment for mainnet-beta.');
    console.log('   Make sure you have real SOL and understand the risks.\n');

    try {
      // Step 1: Test connection
      await this.testConnection();

      // Step 2: Setup wallet (user must provide)
      await this.setupWallet();

      // Step 3: Validate wallet
      await this.validateWallet();

      // Step 4: Test SDK connections
      await this.testSDKs();

      // Step 5: Validate environment
      await this.validateEnvironment();

      // Step 6: Generate configuration files
      await this.generateConfigFiles();

      this.result.success = true;
      console.log('\n✅ Mainnet setup completed successfully!');
    } catch (error) {
      this.result.errors.push(`Setup failed: ${error}`);
      console.error('\n❌ Mainnet setup failed:', error);
    } finally {
      this.rl.close();
    }

    return this.result;
  }

  private async testConnection(): Promise<void> {
    console.log('🔌 Testing Solana mainnet connection...');
    
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
    console.log('\n💰 Setting up mainnet wallet...');
    
    const walletChoice = await this.question(
      'Choose wallet setup method:\n' +
      '1. Import existing keypair file\n' +
      '2. Enter private key manually\n' +
      '3. Use existing wallet address (read-only)\n' +
      'Enter choice (1-3): '
    );

    switch (walletChoice) {
      case '1':
        await this.importKeypairFile();
        break;
      case '2':
        await this.importPrivateKey();
        break;
      case '3':
        await this.setupReadOnlyWallet();
        break;
      default:
        throw new Error('Invalid choice selected');
    }
  }

  private async importKeypairFile(): Promise<void> {
    const filePath = await this.question('Enter path to keypair file: ');
    
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      const keypairData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      this.wallet = Keypair.fromSecretKey(new Uint8Array(keypairData));
      
      console.log(`   ✅ Imported wallet: ${this.wallet.publicKey.toString()}`);
    } catch (error) {
      throw new Error(`Failed to import keypair: ${error}`);
    }
  }

  private async importPrivateKey(): Promise<void> {
    const privateKey = await this.question('Enter private key (base58 or base64): ');
    
    try {
      let secretKey: Uint8Array;
      
      // Try base58 first
      try {
        secretKey = bs58.decode(privateKey);
      } catch {
        // Try base64
        secretKey = new Uint8Array(Buffer.from(privateKey, 'base64'));
      }
      
      this.wallet = Keypair.fromSecretKey(secretKey);
      console.log(`   ✅ Imported wallet: ${this.wallet.publicKey.toString()}`);
    } catch (error) {
      throw new Error(`Failed to import private key: ${error}`);
    }
  }

  private async setupReadOnlyWallet(): Promise<void> {
    const publicKey = await this.question('Enter wallet public key: ');
    
    try {
      new PublicKey(publicKey); // Validate public key format
      console.log(`   ✅ Read-only wallet: ${publicKey}`);
      console.log('   ⚠️  Read-only mode - some features will be limited');
    } catch (error) {
      throw new Error(`Invalid public key: ${error}`);
    }
  }

  private async validateWallet(): Promise<void> {
    if (!this.wallet) {
      console.log('   ℹ️  Skipping wallet validation (read-only mode)');
      return;
    }

    console.log('\n🔍 Validating wallet...');
    
    try {
      const balance = await this.connection.getBalance(this.wallet.publicKey);
      const solBalance = balance / 1e9;
      
      console.log(`   ✅ Wallet address: ${this.wallet.publicKey.toString()}`);
      console.log(`   ✅ Balance: ${solBalance.toFixed(4)} SOL`);
      
      this.result.walletAddress = this.wallet.publicKey.toString();
      this.result.balance = solBalance;
      
      if (solBalance < this.config.minBalance) {
        this.result.warnings.push(
          `Low balance detected (${solBalance} SOL). Recommended minimum: ${this.config.minBalance} SOL`
        );
      }
    } catch (error) {
      throw new Error(`Wallet validation failed: ${error}`);
    }
  }

  private async testSDKs(): Promise<void> {
    console.log('\n🔧 Testing Saros SDKs...');
    
    try {
      // Test AMM SDK
      console.log('   📊 Testing AMM SDK...');
      if (this.wallet) {
        const ammSDK = new SarosAMM(this.connection, this.wallet);
        console.log('   ✅ AMM SDK initialized successfully');
      } else {
        console.log('   ⚠️  AMM SDK test skipped (read-only mode)');
      }
      
      // Test DLMM SDK
      console.log('   🎯 Testing DLMM SDK...');
      const dlmmSDK = new LiquidityBookServices({ mode: MODE.MAINNET });
      console.log('   ✅ DLMM SDK initialized successfully');
      
      this.result.sdkStatus = {
        amm: !!this.wallet,
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
      const envContent = `# Saros Mainnet Configuration
SOLANA_RPC_URL=${this.config.rpcUrl}
SOLANA_NETWORK=${this.config.network}
${this.wallet ? `WALLET_PRIVATE_KEY=${Buffer.from(this.wallet.secretKey).toString('base64')}` : ''}
WALLET_PUBLIC_KEY=${this.wallet ? this.wallet.publicKey.toString() : 'READ_ONLY_MODE'}
MIN_BALANCE=${this.config.minBalance}
`;

      fs.writeFileSync('.env.mainnet', envContent);
      console.log('   ✅ Created .env.mainnet');
      
      // Create mainnet setup summary
      const summaryContent = `# Mainnet Setup Summary

Generated: ${new Date().toISOString()}
Network: ${this.config.network}
RPC URL: ${this.config.rpcUrl}

## Wallet Information
${this.wallet ? 
  `Public Key: ${this.wallet.publicKey.toString()}
Balance: ${this.result.balance} SOL` : 
  'Mode: Read-only (no private key)'
}

## SDK Status
- AMM SDK: ${this.result.sdkStatus?.amm ? '✅ Ready' : '❌ Failed'}
- DLMM SDK: ${this.result.sdkStatus?.dlmm ? '✅ Ready' : '❌ Failed'}

## Security Notes
⚠️  IMPORTANT: This is mainnet-beta configuration
⚠️  Real funds are at risk
⚠️  Test thoroughly on devnet first
⚠️  Keep private keys secure

## Next Steps
1. Copy .env.mainnet to .env for local development
2. Test with small amounts first
3. Run examples: npm run example:amm-swap
4. Monitor transactions carefully

## Warnings
${this.result.warnings.map(w => `- ${w}`).join('\n')}

## Errors
${this.result.errors.map(e => `- ${e}`).join('\n')}
`;

      fs.writeFileSync('MAINNET_SETUP_SUMMARY.md', summaryContent);
      console.log('   ✅ Created MAINNET_SETUP_SUMMARY.md');
      
    } catch (error) {
      this.result.warnings.push(`Config file generation warning: ${error}`);
    }
  }

  private question(query: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(query, resolve);
    });
  }

  // Utility methods
  getWallet(): Keypair | null {
    return this.wallet;
  }

  getConnection(): Connection {
    return this.connection;
  }

  getConfig(): MainnetConfig {
    return this.config;
  }
}

// CLI execution
async function main() {
  const setup = new MainnetSetup();
  
  try {
    const result = await setup.run();
    
    console.log('\n📋 Setup Summary:');
    console.log(`   Success: ${result.success ? '✅ Yes' : '❌ No'}`);
    console.log(`   Wallet: ${result.walletAddress || 'Read-only mode'}`);
    console.log(`   Balance: ${result.balance ? `${result.balance} SOL` : 'N/A'}`);
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
    console.log('   1. Review MAINNET_SETUP_SUMMARY.md for details');
    console.log('   2. Copy .env.mainnet to .env for development');
    console.log('   3. Test with small amounts first');
    console.log('   4. Monitor all transactions carefully');
    
  } catch (error) {
    console.error('❌ Setup execution failed:', error);
    process.exit(1);
  }
}

// Export for programmatic use
export { MainnetSetup, MainnetConfig, MainnetSetupResult };

// Run if called directly
if (require.main === module) {
  main();
}
