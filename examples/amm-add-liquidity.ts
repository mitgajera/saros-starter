import { SarosClient } from '@saros-labs/sdk';

/**
 * AMM Add Liquidity Example
 * 
 * This example demonstrates how to add liquidity to Saros AMM pools.
 */

async function addLiquidityExample() {
  try {
    // Initialize the Saros client
    const client = new SarosClient({
      endpoint: 'https://api.mainnet-beta.solana.com',
      wallet: yourWallet // Replace with your actual wallet
    });

    console.log('💧 Starting liquidity addition...');

    // Add liquidity to SOL-USDC pool
    const addLiquidityResult = await client.amm.addLiquidity({
      tokenAMint: 'So11111111111111111111111111111112', // SOL
      tokenBMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
      tokenAAmount: 1000000000, // 1 SOL
      tokenBAmount: 20000000, // 20 USDC
      slippage: 0.5
    });

    console.log('✅ Liquidity added successfully!');
    console.log(`   Transaction signature: ${addLiquidityResult.signature}`);
    console.log(`   LP tokens received: ${addLiquidityResult.lpTokens / 1e9}`);
    console.log(`   Pool address: ${addLiquidityResult.poolAddress}`);

  } catch (error) {
    console.error('❌ Add liquidity failed:', error.message);
    
    if (error.message.includes('insufficient balance')) {
      console.log('💡 Make sure you have enough SOL and USDC in your wallet');
    } else if (error.message.includes('pool not found')) {
      console.log('💡 The specified pool may not exist yet');
    }
  }
}

// Proportional liquidity addition
async function proportionalLiquidityExample() {
  try {
    const client = new SarosClient({
      endpoint: 'https://api.mainnet-beta.solana.com',
      wallet: yourWallet
    });

    console.log('⚖️ Starting proportional liquidity addition...');

    // Add liquidity proportionally based on current pool ratio
    const proportionalResult = await client.amm.addLiquidityProportional({
      tokenAMint: 'So11111111111111111111111111111112', // SOL
      tokenBMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
      maxTokenAAmount: 1000000000, // Max 1 SOL
      maxTokenBAmount: 20000000, // Max 20 USDC
      slippage: 0.5
    });

    console.log('✅ Proportional liquidity added!');
    console.log(`   Signature: ${proportionalResult.signature}`);
    console.log(`   SOL used: ${proportionalResult.tokenAAmount / 1e9}`);
    console.log(`   USDC used: ${proportionalResult.tokenBAmount / 1e6}`);

  } catch (error) {
    console.error('❌ Proportional liquidity failed:', error.message);
  }
}

// Multiple pool liquidity
async function multiplePoolLiquidityExample() {
  try {
    const client = new SarosClient({
      endpoint: 'https://api.mainnet-beta.solana.com',
      wallet: yourWallet
    });

    console.log('🏊 Starting multiple pool liquidity...');

    const pools = [
      {
        tokenA: 'So11111111111111111111111111111112', // SOL
        tokenB: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
        amountA: 500000000, // 0.5 SOL
        amountB: 10000000 // 10 USDC
      },
      {
        tokenA: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
        tokenB: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
        amountA: 5000000, // 5 USDC
        amountB: 5000000 // 5 USDT
      }
    ];

    const results = [];
    for (const pool of pools) {
      const result = await client.amm.addLiquidity({
        tokenAMint: pool.tokenA,
        tokenBMint: pool.tokenB,
        tokenAAmount: pool.amountA,
        tokenBAmount: pool.amountB,
        slippage: 0.5
      });
      results.push(result);
    }

    console.log('✅ Multiple pool liquidity added!');
    results.forEach((result, index) => {
      console.log(`   Pool ${index + 1}: ${result.signature}`);
    });

  } catch (error) {
    console.error('❌ Multiple pool liquidity failed:', error.message);
  }
}

// View existing positions
async function viewPositionsExample() {
  try {
    const client = new SarosClient({
      endpoint: 'https://api.mainnet-beta.solana.com',
      wallet: yourWallet
    });

    console.log('👀 Viewing your liquidity positions...');

    // Get all your liquidity positions
    const positions = await client.amm.getPositions({
      wallet: yourWallet.publicKey
    });

    if (positions.length === 0) {
      console.log('📭 No liquidity positions found');
      return;
    }

    console.log(`📊 Found ${positions.length} position(s):`);
    positions.forEach((position, index) => {
      console.log(`\n   Position ${index + 1}:`);
      console.log(`     Pool: ${position.tokenASymbol}-${position.tokenBSymbol}`);
      console.log(`     LP Tokens: ${position.lpTokens / 1e9}`);
      console.log(`     Value: $${position.totalValue.toFixed(2)}`);
      console.log(`     Fees Earned: $${position.feesEarned.toFixed(2)}`);
    });

  } catch (error) {
    console.error('❌ Failed to view positions:', error.message);
  }
}

// Calculate impermanent loss
async function calculateImpermanentLossExample() {
  try {
    const client = new SarosClient({
      endpoint: 'https://api.mainnet-beta.solana.com',
      wallet: yourWallet
    });

    console.log('🧮 Calculating impermanent loss...');

    // Calculate potential impermanent loss
    const ilCalculation = await client.amm.calculateImpermanentLoss({
      tokenAPrice: 100, // Current SOL price
      tokenBPrice: 1, // Current USDC price
      initialTokenAPrice: 90, // SOL price when deposited
      initialTokenBPrice: 1 // USDC price when deposited
    });

    console.log('📈 Impermanent loss calculation:');
    console.log(`   Current SOL price: $${ilCalculation.tokenAPrice}`);
    console.log(`   Initial SOL price: $${ilCalculation.initialTokenAPrice}`);
    console.log(`   Impermanent loss: ${ilCalculation.loss.toFixed(2)}%`);
    console.log(`   Break-even price: $${ilCalculation.breakEvenPrice}`);

  } catch (error) {
    console.error('❌ Impermanent loss calculation failed:', error.message);
  }
}

// Export functions for use in other examples
export {
  addLiquidityExample,
  proportionalLiquidityExample,
  multiplePoolLiquidityExample,
  viewPositionsExample,
  calculateImpermanentLossExample
};

// Run examples if this file is executed directly
if (require.main === module) {
  console.log('🏃 Running AMM liquidity examples...\n');
  
  addLiquidityExample()
    .then(() => proportionalLiquidityExample())
    .then(() => multiplePoolLiquidityExample())
    .then(() => viewPositionsExample())
    .then(() => calculateImpermanentLossExample())
    .then(() => console.log('\n✨ All examples completed!'))
    .catch(console.error);
}
