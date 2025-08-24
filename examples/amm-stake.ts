import { SarosClient } from '@saros-labs/sdk';

/**
 * AMM Staking Example
 * 
 * This example demonstrates how to stake LP tokens and earn rewards on Saros.
 */

async function stakeLPTokensExample() {
  try {
    // Initialize the Saros client
    const client = new SarosClient({
      endpoint: 'https://api.mainnet-beta.solana.com',
      wallet: yourWallet // Replace with your actual wallet
    });

    console.log('🔒 Starting LP token staking...');

    // Stake your LP tokens
    const stakeResult = await client.staking.stake({
      poolId: 'sol-usdc-pool-id', // Replace with actual pool ID
      lpTokenAmount: 1000000000, // 1 LP token (adjust based on your balance)
      lockPeriod: 30 // Lock for 30 days (optional)
    });

    console.log('✅ Staking successful!');
    console.log(`   Transaction signature: ${stakeResult.signature}`);
    console.log(`   Staking position ID: ${stakeResult.positionId}`);
    console.log(`   Lock period: ${stakeResult.lockPeriod || 'None'} days`);

  } catch (error) {
    console.error('❌ Staking failed:', error.message);
    
    if (error.message.includes('insufficient balance')) {
      console.log('💡 Make sure you have LP tokens to stake');
    } else if (error.message.includes('pool not found')) {
      console.log('💡 The specified staking pool may not exist');
    }
  }
}

// Multiple staking strategies
async function multipleStakingStrategiesExample() {
  try {
    const client = new SarosClient({
      endpoint: 'https://api.mainnet-beta.solana.com',
      wallet: yourWallet
    });

    console.log('📊 Starting multiple staking strategies...');

    const strategies = [
      { amount: 1000000000 * 0.3, lockPeriod: 30 }, // 30% for 30 days
      { amount: 1000000000 * 0.4, lockPeriod: 90 }, // 40% for 90 days
      { amount: 1000000000 * 0.3, lockPeriod: 180 } // 30% for 180 days
    ];

    const results = [];
    for (const strategy of strategies) {
      const result = await client.staking.stake({
        poolId: 'sol-usdc-pool-id',
        lpTokenAmount: strategy.amount,
        lockPeriod: strategy.lockPeriod
      });
      results.push(result);
    }

    console.log('✅ Multiple staking strategies completed!');
    results.forEach((result, index) => {
      console.log(`   Strategy ${index + 1}: ${result.signature} (${strategies[index].lockPeriod} days)`);
    });

  } catch (error) {
    console.error('❌ Multiple staking strategies failed:', error.message);
  }
}

// View staking positions
async function viewStakingPositionsExample() {
  try {
    const client = new SarosClient({
      endpoint: 'https://api.mainnet-beta.solana.com',
      wallet: yourWallet
    });

    console.log('👀 Viewing your staking positions...');

    // Get all your staking positions
    const stakingPositions = await client.staking.getPositions({
      wallet: yourWallet.publicKey
    });

    if (stakingPositions.length === 0) {
      console.log('📭 No staking positions found');
      return;
    }

    console.log(`📊 Found ${stakingPositions.length} staking position(s):`);
    stakingPositions.forEach((position, index) => {
      console.log(`\n   Position ${index + 1}:`);
      console.log(`     Position ID: ${position.id}`);
      console.log(`     LP Tokens staked: ${position.lpTokensStaked / 1e9}`);
      console.log(`     Lock period: ${position.lockPeriod || 'None'} days`);
      console.log(`     Staking date: ${new Date(position.stakingDate).toLocaleDateString()}`);
      console.log(`     Unlock date: ${position.unlockDate ? new Date(position.unlockDate).toLocaleDateString() : 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Failed to view staking positions:', error.message);
  }
}

// Check and claim rewards
async function checkAndClaimRewardsExample() {
  try {
    const client = new SarosClient({
      endpoint: 'https://api.mainnet-beta.solana.com',
      wallet: yourWallet
    });

    console.log('💰 Checking staking rewards...');

    // Get all your staking positions
    const positions = await client.staking.getPositions({
      wallet: yourWallet.publicKey
    });

    if (positions.length === 0) {
      console.log('📭 No staking positions found');
      return;
    }

    let totalRewards = 0;
    for (const position of positions) {
      const rewards = await client.staking.getRewards({
        positionId: position.id
      });

      console.log(`\n   Position ${position.id}:`);
      console.log(`     Available rewards: $${rewards.available.toFixed(2)}`);
      console.log(`     Total earned: $${rewards.totalEarned.toFixed(2)}`);

      totalRewards += rewards.available;

      // Claim rewards if available
      if (rewards.available > 0) {
        console.log(`     Claiming rewards...`);
        const claimResult = await client.staking.claimRewards({
          positionId: position.id,
          amount: rewards.available
        });
        console.log(`     ✅ Rewards claimed: ${claimResult.signature}`);
      }
    }

    console.log(`\n💰 Total rewards available: $${totalRewards.toFixed(2)}`);

  } catch (error) {
    console.error('❌ Failed to check/claim rewards:', error.message);
  }
}

// Unstake LP tokens
async function unstakeLPTokensExample() {
  try {
    const client = new SarosClient({
      endpoint: 'https://api.mainnet-beta.solana.com',
      wallet: yourWallet
    });

    console.log('🔓 Starting LP token unstaking...');

    // Get your staking positions
    const positions = await client.staking.getPositions({
      wallet: yourWallet.publicKey
    });

    if (positions.length === 0) {
      console.log('📭 No staking positions found');
      return;
    }

    // Unstake from the first position (you can modify this logic)
    const position = positions[0];
    
    // Check if position is locked
    if (position.unlockDate && new Date() < new Date(position.unlockDate)) {
      console.log(`⚠️ Position is locked until ${new Date(position.unlockDate).toLocaleDateString()}`);
      console.log('💡 Consider using emergency unstake (may incur penalties)');
      return;
    }

    // Unstake all LP tokens
    const unstakeResult = await client.staking.unstake({
      positionId: position.id,
      amount: position.lpTokensStaked
    });

    console.log('✅ Unstaking successful!');
    console.log(`   Transaction signature: ${unstakeResult.signature}`);
    console.log(`   LP tokens returned: ${unstakeResult.lpTokensReturned / 1e9}`);

  } catch (error) {
    console.error('❌ Unstaking failed:', error.message);
  }
}

// Emergency unstake
async function emergencyUnstakeExample() {
  try {
    const client = new SarosClient({
      endpoint: 'https://api.mainnet-beta.solana.com',
      wallet: yourWallet
    });

    console.log('🚨 Starting emergency unstake...');

    // Get your staking positions
    const positions = await client.staking.getPositions({
      wallet: yourWallet.publicKey
    });

    if (positions.length === 0) {
      console.log('📭 No staking positions found');
      return;
    }

    // Emergency unstake from the first position
    const position = positions[0];
    
    console.log(`⚠️ Emergency unstaking from position ${position.id}`);
    console.log('⚠️ This may incur penalties!');

    const emergencyUnstakeResult = await client.staking.emergencyUnstake({
      positionId: position.id
    });

    console.log('✅ Emergency unstaking completed!');
    console.log(`   Transaction signature: ${emergencyUnstakeResult.signature}`);
    console.log(`   Penalty applied: $${emergencyUnstakeResult.penalty.toFixed(2)}`);

  } catch (error) {
    console.error('❌ Emergency unstake failed:', error.message);
  }
}

// Staking performance analytics
async function stakingPerformanceExample() {
  try {
    const client = new SarosClient({
      endpoint: 'https://api.mainnet-beta.solana.com',
      wallet: yourWallet
    });

    console.log('📈 Checking staking performance...');

    // Get staking performance metrics
    const performance = await client.staking.getPerformance({
      wallet: yourWallet.publicKey,
      timeframe: '30d' // 7d, 30d, 90d, 1y
    });

    console.log('📊 Staking Performance (30 days):');
    console.log(`   APY: ${(performance.apy * 100).toFixed(2)}%`);
    console.log(`   Total rewards earned: $${performance.totalRewards.toFixed(2)}`);
    console.log(`   Average lock period: ${performance.avgLockPeriod.toFixed(1)} days`);
    console.log(`   Total positions: ${performance.totalPositions}`);

  } catch (error) {
    console.error('❌ Failed to get staking performance:', error.message);
  }
}

// Export functions for use in other examples
export {
  stakeLPTokensExample,
  multipleStakingStrategiesExample,
  viewStakingPositionsExample,
  checkAndClaimRewardsExample,
  unstakeLPTokensExample,
  emergencyUnstakeExample,
  stakingPerformanceExample
};

// Run examples if this file is executed directly
if (require.main === module) {
  console.log('🏃 Running AMM staking examples...\n');
  
  stakeLPTokensExample()
    .then(() => multipleStakingStrategiesExample())
    .then(() => viewStakingPositionsExample())
    .then(() => checkAndClaimRewardsExample())
    .then(() => unstakeLPTokensExample())
    .then(() => emergencyUnstakeExample())
    .then(() => stakingPerformanceExample())
    .then(() => console.log('\n✨ All examples completed!'))
    .catch(console.error);
}
