# Liquidity Tutorial

Learn how to add and manage liquidity on Saros AMM.

## Overview

Providing liquidity to Saros AMM pools allows you to earn trading fees and participate in the ecosystem's growth.

## Prerequisites

- Complete the [Quickstart Guide](quickstart-amm.md)
- Have both tokens for the pair you want to provide liquidity to

## Adding Liquidity

### Basic Liquidity Addition

```typescript
import { SarosClient } from '@saros-labs/sdk';

const client = new SarosClient({
  endpoint: 'https://api.mainnet-beta.solana.com',
  wallet: yourWallet
});

// Add liquidity to SOL-USDC pool
const addLiquidityResult = await client.amm.addLiquidity({
  tokenAMint: 'So11111111111111111111111111111112', // SOL
  tokenBMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  tokenAAmount: 1000000000, // 1 SOL
  tokenBAmount: 20000000, // 20 USDC
  slippage: 0.5
});

console.log('Liquidity added:', addLiquidityResult);
```

### Proportional Liquidity

```typescript
// Add liquidity proportionally based on current pool ratio
const proportionalResult = await client.amm.addLiquidityProportional({
  tokenAMint: 'So11111111111111111111111111111112',
  tokenBMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  maxTokenAAmount: 1000000000, // Max 1 SOL
  maxTokenBAmount: 20000000, // Max 20 USDC
  slippage: 0.5
});
```

## Removing Liquidity

### Remove All Liquidity

```typescript
// Remove all liquidity from a position
const removeResult = await client.amm.removeLiquidity({
  tokenAMint: 'So11111111111111111111111111111112',
  tokenBMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  lpTokenAmount: yourLPTokenBalance,
  slippage: 0.5
});
```

### Partial Liquidity Removal

```typescript
// Remove partial liquidity
const partialRemoveResult = await client.amm.removeLiquidity({
  tokenAMint: 'So11111111111111111111111111111112',
  tokenBMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  lpTokenAmount: yourLPTokenBalance / 2, // Remove 50%
  slippage: 0.5
});
```

## Managing Positions

### View Your Positions

```typescript
// Get all your liquidity positions
const positions = await client.amm.getPositions({
  wallet: yourWallet.publicKey
});

console.log('Your positions:', positions);
```

### Position Details

```typescript
// Get detailed information about a specific position
const position = await client.amm.getPosition({
  positionId: 'your-position-id',
  tokenAMint: 'So11111111111111111111111111111112',
  tokenBMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
});

console.log('Position value:', position.totalValue);
console.log('Fees earned:', position.feesEarned);
```

## Impermanent Loss

### Understanding Impermanent Loss

Impermanent loss occurs when the price ratio of your deposited tokens changes compared to when you deposited them.

```typescript
// Calculate potential impermanent loss
const impermanentLoss = await client.amm.calculateImpermanentLoss({
  tokenAPrice: 100, // Current SOL price
  tokenBPrice: 1, // Current USDC price
  initialTokenAPrice: 90, // SOL price when deposited
  initialTokenBPrice: 1 // USDC price when deposited
});

console.log('Impermanent loss:', impermanentLoss);
```

## Best Practices

1. **Diversify** - Don't put all your liquidity in one pool
2. **Monitor fees** - Track your earned trading fees
3. **Understand risks** - Be aware of impermanent loss
4. **Use stable pairs** - Consider stablecoin pairs for lower volatility
5. **Regular rebalancing** - Monitor and rebalance positions as needed

## Next Steps

- Learn about [staking your LP tokens](tutorial-stake.md)
- Explore [DLMM liquidity](../dlmm/tutorial-dlmm-liquidity.md)
- Check out [advanced AMM features](../docs/README.md)
