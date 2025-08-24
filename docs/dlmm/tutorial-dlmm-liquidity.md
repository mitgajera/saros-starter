# DLMM Liquidity Tutorial

Learn how to add and manage concentrated liquidity using Saros DLMM.

## Overview

DLMM liquidity allows you to concentrate your capital within specific price ranges, providing more efficient capital utilization and potentially higher returns.

## Prerequisites

- Complete the [DLMM Quickstart](quickstart-dlmm.md)
- Have both tokens for the pair you want to provide liquidity to
- Understand [AMM liquidity concepts](../guides/tutorial-liquidity.md)

## Adding DLMM Liquidity

### Basic Position Creation

```typescript
import { SarosClient } from '@saros-labs/sdk';

const client = new SarosClient({
  endpoint: 'https://api.mainnet-beta.solana.com',
  wallet: yourWallet
});

// Create a concentrated liquidity position
const position = await client.dlmm.addLiquidity({
  tokenAMint: 'So11111111111111111111111111111112', // SOL
  tokenBMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  tokenAAmount: 1000000000, // 1 SOL
  tokenBAmount: 20000000, // 20 USDC
  priceRange: {
    lower: 90, // $90 per SOL
    upper: 110 // $110 per SOL
  },
  feeTier: 0.003 // 0.3% fee tier
});

console.log('Position created:', position);
```

### Multiple Range Positions

```typescript
// Create multiple positions across different price ranges
const ranges = [
  { lower: 85, upper: 95, weight: 0.3 },
  { lower: 95, upper: 105, weight: 0.4 },
  { lower: 105, upper: 115, weight: 0.3 }
];

for (const range of ranges) {
  const amount = range.weight * totalAmount;
  await client.dlmm.addLiquidity({
    tokenAMint: 'So11111111111111111111111111111112',
    tokenBMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    tokenAAmount: amount * 0.5, // 50% SOL
    tokenBAmount: amount * 0.5, // 50% USDC
    priceRange: range,
    feeTier: 0.003
  });
}
```

## Managing Positions

### View Your Positions

```typescript
// Get all your DLMM positions
const positions = await client.dlmm.getPositions({
  wallet: yourWallet.publicKey
});

console.log('Your DLMM positions:', positions);
```

### Position Details

```typescript
// Get detailed information about a specific position
const position = await client.dlmm.getPosition({
  positionId: 'your-position-id'
});

console.log('Position value:', position.totalValue);
console.log('Fees earned:', position.feesEarned);
console.log('Price range:', position.priceRange);
console.log('Liquidity utilization:', position.utilization);
```

### Position Analytics

```typescript
// Get performance metrics for your position
const analytics = await client.dlmm.getPositionAnalytics({
  positionId: 'your-position-id',
  timeframe: '30d'
});

console.log('APY:', analytics.apy);
console.log('Impermanent loss:', analytics.impermanentLoss);
console.log('Fee efficiency:', analytics.feeEfficiency);
```

## Modifying Positions

### Adding More Liquidity

```typescript
// Add more liquidity to an existing position
const addResult = await client.dlmm.addLiquidityToPosition({
  positionId: 'your-position-id',
  tokenAAmount: 500000000, // 0.5 SOL
  tokenBAmount: 10000000, // 10 USDC
  slippage: 0.5
});
```

### Removing Liquidity

```typescript
// Remove liquidity from a position
const removeResult = await client.dlmm.removeLiquidity({
  positionId: 'your-position-id',
  liquidityAmount: position.liquidity / 2, // Remove 50%
  slippage: 0.5
});
```

### Adjusting Price Ranges

```typescript
// Adjust the price range of your position
const adjustResult = await client.dlmm.adjustPosition({
  positionId: 'your-position-id',
  newPriceRange: {
    lower: 95, // New lower bound
    upper: 115 // New upper bound
  },
  slippage: 0.5
});
```

## Advanced Strategies

### Rebalancing Positions

```typescript
// Rebalance position based on current market conditions
const rebalanceResult = await client.dlmm.rebalancePosition({
  positionId: 'your-position-id',
  targetRatio: 0.5, // Target 50/50 SOL/USDC ratio
  slippage: 0.5
});
```

### Dynamic Range Adjustment

```typescript
// Automatically adjust ranges based on market volatility
const marketData = await client.dlmm.getMarketData({
  tokenAMint: 'So11111111111111111111111111111112',
  tokenBMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
});

if (marketData.volatility > 0.15) {
  // High volatility - widen ranges
  await client.dlmm.adjustPosition({
    positionId: 'your-position-id',
    newPriceRange: {
      lower: position.priceRange.lower * 0.9,
      upper: position.priceRange.upper * 1.1
    }
  });
}
```

### Fee Optimization

```typescript
// Choose optimal fee tier based on trading volume
const feeTiers = await client.dlmm.getFeeTiers({
  tokenAMint: 'So11111111111111111111111111111112',
  tokenBMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
});

// Select fee tier based on expected trading volume
const optimalFeeTier = expectedVolume > 1000000 ? 0.001 : 0.003;
```

## Risk Management

### Understanding Impermanent Loss

```typescript
// Calculate potential impermanent loss
const ilCalculation = await client.dlmm.calculateImpermanentLoss({
  positionId: 'your-position-id',
  currentPrice: 100,
  initialPrice: 90
});

console.log('Impermanent loss:', ilCalculation.loss);
console.log('Break-even price:', ilCalculation.breakEvenPrice);
```

### Position Monitoring

```typescript
// Set up alerts for position health
const positionHealth = await client.dlmm.getPositionHealth({
  positionId: 'your-position-id'
});

if (positionHealth.riskLevel === 'high') {
  console.log('Consider rebalancing or adjusting ranges');
}
```

## Best Practices

1. **Diversify ranges** - Spread liquidity across multiple price points
2. **Monitor utilization** - Ensure your liquidity is actively used
3. **Regular rebalancing** - Adjust positions based on market conditions
4. **Fee tier selection** - Choose fees based on expected trading volume
5. **Risk assessment** - Understand impermanent loss implications
6. **Market timing** - Consider market conditions when setting ranges

## Next Steps

- Learn about [DLMM swaps](tutorial-dlmm-swap.md)
- Explore [Rust DLMM development](../rust/quickstart-rust-dlmm.md)
- Check out [advanced DLMM strategies](../docs/README.md)
