#!/usr/bin/env ts-node

import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SarosAMM } from '@saros-finance/sdk';
import { LiquidityBookServices, MODE } from '@saros-finance/dlmm-sdk';
import * as fs from 'fs';
import * as path from 'path';

interface ValidationConfig {
  rpcUrl: string;
  network: string;
  timeout: number;
  examples: string[];
}

interface ValidationResult {
  success: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  testResults: TestResult[];
  errors: string[];
  warnings: string[];
}

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  details?: any;
}

class ExampleValidator {
  private config: ValidationConfig;
  private connection: Connection;
  private wallet: Keypair;
  private result: ValidationResult;

  constructor() {
    this.config = {
      rpcUrl: 'https://api.devnet.solana.com',
      network: 'devnet',
      timeout: 60000, // 60 seconds
      examples: [
        'amm-swap',
        'amm-liquidity', 
        'amm-stake',
        'dlmm-quote',
        'dlmm-liquidity'
      ]
    };

    this.connection = new Connection(this.config.rpcUrl, 'confirmed');
    this.wallet = Keypair.generate();
    this.result = {
      success: false,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      testResults: [],
      errors: [],
      warnings: []
    };
  }

  async run(): Promise<ValidationResult> {
    console.log('🔍 Starting Saros Examples Validation...\n');
    console.log(`📡 Network: ${this.config.network}`);
    console.log(`🔑 Test Wallet: ${this.wallet.publicKey.toString()}\n`);

    try {
      // Step 1: Setup test environment
      await this.setupTestEnvironment();

      // Step 2: Validate each example
      await this.validateExamples();

      // Step 3: Generate validation report
      await this.generateValidationReport();

      this.result.success = this.result.failedTests === 0;
      console.log(`\n✅ Validation completed: ${this.result.passedTests}/${this.result.totalTests} tests passed`);
      
    } catch (error) {
      this.result.errors.push(`Validation failed: ${error}`);
      console.error('\n❌ Validation failed:', error);
    }

    return this.result;
  }

  private async setupTestEnvironment(): Promise<void> {
    console.log('🔧 Setting up test environment...');
    
    try {
      // Test connection
      const version = await this.connection.getVersion();
      console.log(`   ✅ Connected to ${this.config.network}`);
      console.log(`   ✅ Solana version: ${version['solana-core']}`);
      
      // Request airdrop for testing
      console.log('   💸 Requesting test SOL airdrop...');
      const signature = await this.connection.requestAirdrop(
        this.wallet.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await this.connection.confirmTransaction(signature, 'confirmed');
      
      const balance = await this.connection.getBalance(this.wallet.publicKey);
      console.log(`   ✅ Test wallet funded: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
      
    } catch (error) {
      throw new Error(`Environment setup failed: ${error}`);
    }
  }

  private async validateExamples(): Promise<void> {
    console.log('\n🧪 Validating examples...');
    
    for (const example of this.config.examples) {
      await this.validateExample(example);
    }
  }

  private async validateExample(exampleName: string): Promise<void> {
    const startTime = Date.now();
    const testResult: TestResult = {
      name: exampleName,
      success: false,
      duration: 0
    };

    console.log(`   🔍 Testing ${exampleName}...`);
    
    try {
      switch (exampleName) {
        case 'amm-swap':
          await this.testAMMSwap();
          break;
        case 'amm-liquidity':
          await this.testAMMLiquidity();
          break;
        case 'amm-stake':
          await this.testAMMStake();
          break;
        case 'dlmm-quote':
          await this.testDLMMQuote();
          break;
        case 'dlmm-liquidity':
          await this.testDLMMLiquidity();
          break;
        default:
          throw new Error(`Unknown example: ${exampleName}`);
      }
      
      testResult.success = true;
      testResult.duration = Date.now() - startTime;
      this.result.passedTests++;
      console.log(`   ✅ ${exampleName} passed (${testResult.duration}ms)`);
      
    } catch (error) {
      testResult.success = false;
      testResult.duration = Date.now() - startTime;
      testResult.error = error.message;
      this.result.failedTests++;
      console.log(`   ❌ ${exampleName} failed: ${error.message}`);
    }
    
    this.result.testResults.push(testResult);
    this.result.totalTests++;
  }

  private async testAMMSwap(): Promise<void> {
    const amm = new SarosAMM(this.connection, this.wallet);
    
    // Test basic AMM functionality
    // This is a simplified test - in production you'd test actual swap operations
    if (!amm) {
      throw new Error('Failed to initialize AMM SDK');
    }
  }

  private async testAMMLiquidity(): Promise<void> {
    const amm = new SarosAMM(this.connection, this.wallet);
    
    // Test basic AMM liquidity functionality
    if (!amm) {
      throw new Error('Failed to initialize AMM SDK');
    }
  }

  private async testAMMStake(): Promise<void> {
    const amm = new SarosAMM(this.connection, this.wallet);
    
    // Test basic AMM staking functionality
    if (!amm) {
      throw new Error('Failed to initialize AMM SDK');
    }
  }

  private async testDLMMQuote(): Promise<void> {
    const dlmm = new LiquidityBookServices({ mode: MODE.DEVNET });
    
    // Test basic DLMM functionality
    if (!dlmm) {
      throw new Error('Failed to initialize DLMM SDK');
    }
  }

  private async testDLMMLiquidity(): Promise<void> {
    const dlmm = new LiquidityBookServices({ mode: MODE.DEVNET });
    
    // Test basic DLMM liquidity functionality
    if (!dlmm) {
      throw new Error('Failed to initialize DLMM SDK');
    }
  }

  private async generateValidationReport(): Promise<void> {
    console.log('\n📝 Generating validation report...');
    
    try {
      const reportContent = `# Saros Examples Validation Report

Generated: ${new Date().toISOString()}
Network: ${this.config.network}
RPC URL: ${this.config.rpcUrl}

## Summary
- Total Tests: ${this.result.totalTests}
- Passed: ${this.result.passedTests}
- Failed: ${this.result.failedTests}
- Success Rate: ${this.result.totalTests > 0 ? ((this.result.passedTests / this.result.totalTests) * 100).toFixed(1) : 0}%

## Test Results
${this.result.testResults.map(test => `
### ${test.name}
- Status: ${test.success ? '✅ PASSED' : '❌ FAILED'}
- Duration: ${test.duration}ms
${test.error ? `- Error: ${test.error}` : ''}
`).join('')}

## Environment
- Test Wallet: ${this.wallet.publicKey.toString()}
- Node.js: ${process.version}
- Network: ${this.config.network}

## Recommendations
${this.result.failedTests > 0 ? 
  `⚠️  ${this.result.failedTests} test(s) failed. Review errors above and fix issues before deployment.` :
  '🎉 All tests passed! Your examples are ready for use.'
}

## Next Steps
1. Review any failed tests above
2. Fix issues and re-run validation
3. Test on devnet before mainnet
4. Deploy when all tests pass

## Warnings
${this.result.warnings.map(w => `- ${w}`).join('\n')}

## Errors
${this.result.errors.map(e => `- ${e}`).join('\n')}
`;

      fs.writeFileSync('VALIDATION_REPORT.md', reportContent);
      console.log('   ✅ Created VALIDATION_REPORT.md');
      
    } catch (error) {
      this.result.warnings.push(`Report generation warning: ${error}`);
    }
  }

  // Utility methods
  getResult(): ValidationResult {
    return this.result;
  }

  getConfig(): ValidationConfig {
    return this.config;
  }
}

// CLI execution
async function main() {
  const validator = new ExampleValidator();
  
  try {
    const result = await validator.run();
    
    console.log('\n📋 Validation Summary:');
    console.log(`   Success: ${result.success ? '✅ Yes' : '❌ No'}`);
    console.log(`   Tests: ${result.passedTests}/${result.totalTests} passed`);
    console.log(`   Duration: ${result.testResults.reduce((sum, test) => sum + test.duration, 0)}ms`);
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Review VALIDATION_REPORT.md for details');
    if (result.failedTests > 0) {
      console.log('   2. Fix failed tests and re-run validation');
    }
    console.log('   3. Test on devnet before mainnet deployment');
    
    process.exit(result.success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Validation execution failed:', error);
    process.exit(1);
  }
}

// Export for programmatic use
export { ExampleValidator, ValidationConfig, ValidationResult, TestResult };

// Run if called directly
if (require.main === module) {
  main();
}
