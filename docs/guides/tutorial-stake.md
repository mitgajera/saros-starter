# Staking Tutorial

Learn how to stake your LP tokens and earn additional rewards on Saros.

## Overview

Staking your liquidity provider (LP) tokens allows you to earn additional rewards beyond the trading fees from providing liquidity.

## Prerequisites

- Complete the [Liquidity Tutorial](tutorial-liquidity.md)
- Have LP tokens from providing liquidity

## Basic Staking

### Stake LP Tokens

```typescript
import { SarosClient } from '@saros-labs/sdk';

const client = new SarosClient({
  endpoint: 'https://api.mainnet-beta.solana.com',
  wallet: yourWallet
});

// Stake your LP tokens
const stakeResult = await client.staking.stake({
  poolId: 'sol-usdc-pool-id',
  lpTokenAmount: yourLPTokenBalance,
  lockPeriod: 30 // Lock for 30 days (optional)
});

console.log('Staking successful:', stakeResult);
```

### View Staking Positions

```typescript
// Get all your staking positions
const stakingPositions = await client.staking.getPositions({
  wallet: yourWallet.publicKey
});

console.log('Your staking positions:', stakingPositions);
```

## Staking Rewards

### Check Rewards

```typescript
// Get current rewards for a staking position
const rewards = await client.staking.getRewards({
  positionId: 'your-staking-position-id'
});

console.log('Available rewards:', rewards.available);
console.log('Total earned:', rewards.totalEarned);
```

### Claim Rewards

```typescript
// Claim your earned rewards
const claimResult = await client.staking.claimRewards({
  positionId: 'your-staking-position-id',
  amount: rewards.available // Claim all available rewards
});

console.log('Rewards claimed:', claimResult);
```

## Advanced Staking

### Locked Staking

```typescript
// Stake with a lock period for higher rewards
const lockedStakeResult = await client.staking.stake({
  poolId: 'sol-usdc-pool-id',
  lpTokenAmount: yourLPTokenBalance,
  lockPeriod: 90, // Lock for 90 days
  lockType: 'flexible' // or 'fixed'
});

console.log('Locked staking position created:', lockedStakeResult);
```

### Multiple Staking Strategies

```typescript
// Create multiple staking positions with different lock periods
const strategies = [
  { amount: yourLPTokenBalance * 0.3, lockPeriod: 30 }, // 30% for 30 days
  { amount: yourLPTokenBalance * 0.4, lockPeriod: 90 }, // 40% for 90 days
  { amount: yourLPTokenBalance * 0.3, lockPeriod: 180 } // 30% for 180 days
];

for (const strategy of strategies) {
  await client.staking.stake({
    poolId: 'sol-usdc-pool-id',
    lpTokenAmount: strategy.amount,
    lockPeriod: strategy.lockPeriod
  });
}
```

## Unstaking

### Unstake LP Tokens

```typescript
// Unstake your LP tokens
const unstakeResult = await client.staking.unstake({
  positionId: 'your-staking-position-id',
  amount: yourStakedAmount
});

console.log('Unstaking successful:', unstakeResult);
```

### Emergency Unstaking

```typescript
// Emergency unstake (may incur penalties)
const emergencyUnstakeResult = await client.staking.emergencyUnstake({
  positionId: 'your-staking-position-id'
});

console.log('Emergency unstaking completed:', emergencyUnstakeResult);
```

## Staking Analytics

### Performance Tracking

```typescript
// Get staking performance metrics
const performance = await client.staking.getPerformance({
  wallet: yourWallet.publicKey,
  timeframe: '30d' // 7d, 30d, 90d, 1y
});

console.log('APY:', performance.apy);
console.log('Total rewards earned:', performance.totalRewards);
console.log('Average lock period:', performance.avgLockPeriod);
```

### Pool Information

```typescript
// Get staking pool details
const poolInfo = await client.staking.getPoolInfo({
  poolId: 'sol-usdc-pool-id'
});

console.log('Total staked:', poolInfo.totalStaked);
console.log('Current APY:', poolInfo.currentApy);
console.log('Lock periods available:', poolInfo.lockPeriods);
```

## Best Practices

1. **Diversify lock periods** - Spread your stakes across different lock periods
2. **Monitor APY changes** - Staking rewards can fluctuate
3. **Consider lock periods** - Longer locks often provide higher rewards
4. **Regular claiming** - Claim rewards regularly to compound earnings
5. **Emergency planning** - Keep some LP tokens unstaked for flexibility

## Next Steps

- Explore [DLMM staking](../dlmm/tutorial-dlmm-liquidity.md)
- Learn about [advanced staking strategies](../docs/README.md)
- Check out [governance participation](../docs/README.md)
