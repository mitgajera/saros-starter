# Troubleshooting Guide

Quick solutions to common issues when building with Saros SDKs.

## 🚨 Common Issues & Solutions

### Connection & Network Issues

#### ❌ "Failed to connect to Solana RPC endpoint"

**Symptoms:**
- Connection timeout errors
- "Network request failed" messages
- RPC calls hanging indefinitely

**Solutions:**

```typescript
// 1. Check your RPC endpoint
const connection = new Connection(
  'https://api.mainnet-beta.solana.com', // Mainnet
  // 'https://api.devnet.solana.com',    // Devnet
  'confirmed'
);

// 2. Use fallback endpoints
const endpoints = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
  'https://rpc.ankr.com/solana'
];

// 3. Implement retry logic
async function connectWithRetry(endpoints: string[]) {
  for (const endpoint of endpoints) {
    try {
      const connection = new Connection(endpoint, 'confirmed');
      await connection.getLatestBlockhash();
      return connection;
    } catch (error) {
      console.log(`Failed to connect to ${endpoint}:`, error.message);
      continue;
    }
  }
  throw new Error('All endpoints failed');
}
```

#### ❌ "Invalid commitment level"

**Symptoms:**
- Commitment parameter errors
- Transaction confirmation issues

**Solutions:**

```typescript
// Use proper commitment levels
const connection = new Connection(endpoint, {
  commitment: 'confirmed', // or 'finalized', 'processed'
  confirmTransactionInitialTimeout: 60000
});

// For transactions
const signature = await connection.sendTransaction(transaction, [payer]);
await connection.confirmTransaction(signature, 'confirmed');
```

### Wallet & Authentication Issues

#### ❌ "Wallet not connected"

**Symptoms:**
- "Wallet not found" errors
- Authentication failures
- Missing public key errors

**Solutions:**

```typescript
// 1. Check wallet connection
if (!wallet || !wallet.publicKey) {
  throw new Error('Please connect your wallet first');
}

// 2. Verify wallet adapter setup
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

const wallets = [
  new PhantomWalletAdapter(),
  // Add other wallet adapters
];

// 3. Handle wallet state changes
useEffect(() => {
  if (wallet && wallet.connected) {
    console.log('Wallet connected:', wallet.publicKey.toString());
  }
}, [wallet]);
```

#### ❌ "Insufficient SOL for transaction fees"

**Symptoms:**
- "Insufficient funds" errors
- Transaction fee calculation failures

**Solutions:**

```typescript
// 1. Check SOL balance before transactions
const balance = await connection.getBalance(wallet.publicKey);
const estimatedFee = 5000; // 0.000005 SOL

if (balance < estimatedFee) {
  throw new Error(`Insufficient SOL. Need at least ${estimatedFee / 1e9} SOL for fees`);
}

// 2. Calculate proper fees
const { feeCalculator } = await connection.getRecentBlockhash();
const fee = feeCalculator.lamportsPerSignature * 2; // Account for multiple signatures

// 3. Add buffer for fees
const transaction = new Transaction().add(instruction);
transaction.feePayer = wallet.publicKey;
transaction.recentBlockhash = blockhash;
```

### AMM SDK Issues

#### ❌ "Pool not found"

**Symptoms:**
- "Pool does not exist" errors
- Invalid pool address errors

**Solutions:**

```typescript
// 1. Verify pool exists
const poolInfo = await client.amm.getPoolInfo({
  tokenAMint: 'So11111111111111111111111111111112', // SOL
  tokenBMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC
});

if (!poolInfo) {
  throw new Error('Pool not found. Check token mints and ensure pool exists.');
}

// 2. Use correct token mints
const SOL_MINT = 'So11111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// 3. Check if pool is active
if (!poolInfo.isActive) {
  throw new Error('Pool is not active. Try a different pool.');
}
```

#### ❌ "Slippage tolerance exceeded"

**Symptoms:**
- Transaction failures due to price movement
- "Slippage exceeded" errors

**Solutions:**

```typescript
// 1. Use appropriate slippage for different pairs
const slippage = isStablePair ? 0.1 : 0.5; // 0.1% for stable, 0.5% for volatile

// 2. Get quote before swap
const quote = await client.amm.getQuote({
  inputMint: SOL_MINT,
  outputMint: USDC_MINT,
  amount: inputAmount
});

// 3. Calculate minimum output with slippage
const minOutputAmount = quote.expectedOutputAmount * (1 - slippage / 100);

// 4. Use quote in swap
const swapResult = await client.amm.swap({
  inputMint: SOL_MINT,
  outputMint: USDC_MINT,
  amount: inputAmount,
  slippage: slippage,
  minOutputAmount: minOutputAmount
});
```

#### ❌ "Insufficient liquidity"

**Symptoms:**
- "Not enough liquidity" errors
- Swap failures for large amounts

**Solutions:**

```typescript
// 1. Check pool liquidity
const poolInfo = await client.amm.getPoolInfo({
  tokenAMint: SOL_MINT,
  tokenBMint: USDC_MINT
});

console.log('Pool liquidity:', {
  tokenA: poolInfo.tokenABalance / 1e9, // SOL
  tokenB: poolInfo.tokenBBalance / 1e6  // USDC
});

// 2. Split large swaps
if (inputAmount > poolInfo.tokenABalance * 0.1) { // More than 10% of pool
  console.log('Large swap detected. Consider splitting into smaller transactions.');
  
  const chunks = Math.ceil(inputAmount / (poolInfo.tokenABalance * 0.05));
  const chunkSize = inputAmount / chunks;
  
  for (let i = 0; i < chunks; i++) {
    await client.amm.swap({
      inputMint: SOL_MINT,
      outputMint: USDC_MINT,
      amount: chunkSize,
      slippage: slippage
    });
  }
}
```

### DLMM SDK Issues

#### ❌ "Price out of range"

**Symptoms:**
- "Price outside specified range" errors
- Liquidity position failures

**Solutions:**

```typescript
// 1. Check current price before setting ranges
const currentPrice = await client.dlmm.getCurrentPrice({
  tokenAMint: SOL_MINT,
  tokenBMint: USDC_MINT
});

// 2. Set realistic price ranges
const priceRange = {
  lower: currentPrice * 0.9,  // 10% below current
  upper: currentPrice * 1.1   // 10% above current
};

// 3. Use market conditions for dynamic ranges
const marketConditions = await client.dlmm.getMarketConditions({
  tokenAMint: SOL_MINT,
  tokenBMint: USDC_MINT
});

const rangeWidth = marketConditions.volatility > 0.1 ? 0.2 : 0.1; // Wider for volatile markets
```

#### ❌ "Insufficient liquidity in range"

**Symptoms:**
- "No liquidity in specified range" errors
- Swap failures in narrow ranges

**Solutions:**

```typescript
// 1. Check liquidity distribution
const liquidityDistribution = await client.dlmm.getLiquidityDistribution({
  pair: pairAddress,
  binRange: [activeId - 50, activeId + 50]
});

// 2. Use multiple ranges for better coverage
const ranges = [
  { lower: activeId - 20, upper: activeId, weight: 0.6 },
  { lower: activeId, upper: activeId + 20, weight: 0.4 }
];

// 3. Find optimal ranges automatically
const optimalRanges = await client.dlmm.getOptimalRanges({
  inputMint: SOL_MINT,
  outputMint: USDC_MINT,
  amount: inputAmount,
  maxRanges: 3
});
```

### Rust SDK Issues

#### ❌ "Compilation errors"

**Symptoms:**
- Cargo build failures
- Type mismatches
- Dependency conflicts

**Solutions:**

```toml
# Cargo.toml - Use compatible versions
[dependencies]
saros-dlmm-sdk-rs = "0.1.0"
solana-client = "1.17"
solana-sdk = "1.17"
tokio = { version = "1.0", features = ["full"] }

# Update Rust toolchain
rustup update stable
rustup default stable

# Clean and rebuild
cargo clean
cargo build
```

#### ❌ "Runtime errors"

**Symptoms:**
- Panic errors
- Memory allocation failures
- Async runtime issues

**Solutions:**

```rust
// 1. Proper error handling
use anyhow::{Context, Result};

async fn robust_operation() -> Result<()> {
    let result = risky_operation().await
        .context("Failed to perform operation")?;
    
    Ok(result)
}

// 2. Memory management
use std::sync::Arc;

let client = Arc::new(DlmmClient::new(config)?);
let client_clone = Arc::clone(&client);

tokio::spawn(async move {
    let result = client_clone.operation().await;
    // Handle result
});

// 3. Async runtime configuration
#[tokio::main(flavor = "multi_thread", worker_threads = 4)]
async fn main() -> Result<()> {
    // Your code here
    Ok(())
}
```

## 🔧 Development Environment Issues

### Node.js Issues

#### ❌ "Module not found"

**Solutions:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+

# Use nvm for version management
nvm use 18
nvm install 18
```

#### ❌ "TypeScript compilation errors"

**Solutions:**

```bash
# Install TypeScript globally
npm install -g typescript

# Check TypeScript version
tsc --version

# Generate tsconfig.json if missing
npx tsc --init

# Build with verbose output
npx tsc --verbose
```

### Rust Issues

#### ❌ "Cargo not found"

**Solutions:**

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Reload shell
source ~/.cargo/env

# Verify installation
cargo --version
rustc --version
```

#### ❌ "Solana CLI not found"

**Solutions:**

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Add to PATH
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Verify installation
solana --version
```

## 📱 Wallet Integration Issues

### Phantom Wallet

#### ❌ "Phantom not detected"

**Solutions:**

```typescript
// 1. Check if Phantom is installed
if (!window.solana || !window.solana.isPhantom) {
  window.open('https://phantom.app/', '_blank');
  return;
}

// 2. Request connection
try {
  const response = await window.solana.connect();
  const publicKey = response.publicKey.toString();
  console.log('Connected to Phantom:', publicKey);
} catch (error) {
  console.error('Failed to connect:', error);
}

// 3. Handle connection state
window.solana.on('connect', () => {
  console.log('Wallet connected');
});

window.solana.on('disconnect', () => {
  console.log('Wallet disconnected');
});
```

### Solflare Wallet

#### ❌ "Solflare connection issues"

**Solutions:**

```typescript
// 1. Check Solflare availability
if (!window.solflare) {
  window.open('https://solflare.com/', '_blank');
  return;
}

// 2. Connect to Solflare
try {
  await window.solflare.connect();
  const publicKey = window.solflare.publicKey.toString();
  console.log('Connected to Solflare:', publicKey);
} catch (error) {
  console.error('Solflare connection failed:', error);
}
```

## 🌐 Network-Specific Issues

### Devnet Issues

#### ❌ "Devnet tokens not found"

**Solutions:**

```typescript
// 1. Use devnet endpoints
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// 2. Airdrop SOL for testing
const signature = await connection.requestAirdrop(wallet.publicKey, 2 * LAMPORTS_PER_SOL);
await connection.confirmTransaction(signature);

// 3. Use devnet token mints
const DEVNET_SOL = 'So11111111111111111111111111111112';
const DEVNET_USDC = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
```

### Mainnet Issues

#### ❌ "Mainnet transaction failures"

**Solutions:**

```typescript
// 1. Use reliable mainnet endpoints
const endpoints = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
  'https://rpc.ankr.com/solana'
];

// 2. Higher transaction fees for priority
const transaction = new Transaction().add(instruction);
transaction.feePayer = wallet.publicKey;

// 3. Use confirmed commitment for faster confirmations
const signature = await connection.sendTransaction(transaction, [payer]);
await connection.confirmTransaction(signature, 'confirmed');
```

## 🧪 Testing Issues

### Jest Configuration

#### ❌ "Jest test failures"

**Solutions:**

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};
```

### Test Setup

```typescript
// test/setup.ts
import { Connection, Keypair } from '@solana/web3.js';

// Mock Solana connection
jest.mock('@solana/web3.js', () => ({
  ...jest.requireActual('@solana/web3.js'),
  Connection: jest.fn().mockImplementation(() => ({
    getLatestBlockhash: jest.fn().mockResolvedValue({
      blockhash: 'test-blockhash',
      lastValidBlockHeight: 1000,
    }),
    getBalance: jest.fn().mockResolvedValue(1000000000),
  })),
}));

// Global test utilities
global.testWallet = Keypair.generate();
global.testConnection = new Connection('http://localhost:8899');
```

## 📞 Getting Help

### Self-Service Resources

1. **Check this troubleshooting guide first**
2. **Review SDK documentation** in the `/docs` folder
3. **Run validation scripts**:
   ```bash
   npm run validate:examples
   npm run test
   ```

### Community Support

- **Discord**: [Saros Dev Station](https://discord.gg/saros)
- **GitHub Issues**: [Report bugs](https://github.com/saros-labs/saros-starter/issues)
- **Documentation**: [docs.saros.finance](https://docs.saros.finance)

### Escalation Process

1. **Search existing issues** on GitHub
2. **Create detailed bug report** with:
   - Error messages and stack traces
   - Code examples
   - Environment details (OS, Node.js version, etc.)
   - Steps to reproduce
3. **Join Discord** for real-time help
4. **Tag maintainers** for urgent issues

## 🚀 Prevention Tips

### Best Practices

1. **Always handle errors gracefully**
2. **Use TypeScript for better type safety**
3. **Test on devnet before mainnet**
4. **Keep dependencies updated**
5. **Use proper logging and monitoring**
6. **Implement retry logic for network operations**
7. **Validate inputs before API calls**
8. **Use environment variables for configuration**

### Code Quality

```typescript
// Good: Proper error handling
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  throw new Error(`Failed to perform operation: ${error.message}`);
}

// Good: Input validation
function validateSwapParams(params: SwapParams) {
  if (!params.inputMint || !params.outputMint) {
    throw new Error('Missing required parameters');
  }
  if (params.amount <= 0) {
    throw new Error('Amount must be positive');
  }
  if (params.slippage < 0 || params.slippage > 100) {
    throw new Error('Slippage must be between 0 and 100');
  }
}
```

---

**Still stuck?** Don't hesitate to reach out to our community! We're here to help you succeed with Saros SDKs. 🚀
