# DLMM Swap Tutorial

Learn how to perform swaps using Saros DLMM (Dynamic Liquidity Market Maker).

## Overview

DLMM swaps leverage concentrated liquidity to provide better pricing and more efficient trading compared to traditional AMM swaps.

## Prerequisites

- Complete the [DLMM Quickstart](quickstart-dlmm.md)
- Have tokens in your wallet for swapping

## Basic DLMM Swap

```typescript
import { SarosClient } from '@saros-labs/sdk';

const client = new SarosClient({
  endpoint: 'https://api.mainnet-beta.solana.com',
  wallet: yourWallet
});

// Basic DLMM swap
const swapResult = await client.dlmm.swap({
  inputMint: 'So11111111111111111111111111111112', // SOL
  outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amount: 1000000000, // 1 SOL
  slippage: 0.5,
  priceRange: {
    lower: 90,
    upper: 110
  }
});
```

## Advanced Swap Strategies

### Multi-Range Swaps

```typescript
// Swap across multiple price ranges for optimal execution
const multiRangeSwap = await client.dlmm.swap({
  inputMint: 'So11111111111111111111111111111112',
  outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  amount: 1000000000,
  slippage: 0.5,
  priceRanges: [
    { lower: 90, upper: 100, weight: 0.4 },
    { lower: 100, upper: 110, weight: 0.6 }
  ]
});
```

### Limit Orders

```typescript
// Place a limit order using DLMM
const limitOrder = await client.dlmm.placeLimitOrder({
  inputMint: 'So11111111111111111111111111111112',
  outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  inputAmount: 1000000000,
  targetPrice: 95, // Execute when SOL reaches $95
  expiry: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
});
```

## Price Range Optimization

### Finding Optimal Ranges

```typescript
// Get optimal price ranges for your swap
const optimalRanges = await client.dlmm.getOptimalRanges({
  inputMint: 'So11111111111111111111111111111112',
  outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  amount: 1000000000,
  maxRanges: 3
});

console.log('Optimal ranges:', optimalRanges);
```

### Dynamic Range Adjustment

```typescript
// Adjust ranges based on market conditions
const marketConditions = await client.dlmm.getMarketConditions({
  inputMint: 'So11111111111111111111111111111112',
  outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
});

const adjustedRanges = marketConditions.volatility > 0.1 
  ? [{ lower: 85, upper: 115 }] // Wider range for high volatility
  : [{ lower: 95, upper: 105 }]; // Narrower range for low volatility
```

## Getting Quotes

### Pre-Swap Analysis

```typescript
// Get detailed quote before swapping
const quote = await client.dlmm.getQuote({
  inputMint: 'So11111111111111111111111111111112',
  outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  amount: 1000000000,
  priceRanges: [
    { lower: 90, upper: 110 }
  ]
});

console.log('Expected output:', quote.expectedOutputAmount);
console.log('Price impact:', quote.priceImpact);
console.log('Fee breakdown:', quote.fees);
```

### Route Optimization

```typescript
// Find the best route for your swap
const routes = await client.dlmm.findRoutes({
  inputMint: 'So11111111111111111111111111111112',
  outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  amount: 1000000000,
  maxRoutes: 5
});

// Select the best route
const bestRoute = routes.sort((a, b) => b.expectedOutput - a.expectedOutput)[0];
```

## Error Handling

```typescript
try {
  const swapResult = await client.dlmm.swap({
    inputMint: 'So11111111111111111111111111111112',
    outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    amount: 1000000000,
    slippage: 0.5,
    priceRange: { lower: 90, upper: 110 }
  });
} catch (error) {
  if (error.message.includes('insufficient liquidity')) {
    console.log('Insufficient liquidity in specified range');
  } else if (error.message.includes('price out of range')) {
    console.log('Current price outside specified range');
  } else if (error.message.includes('slippage exceeded')) {
    console.log('Slippage tolerance exceeded');
  }
}
```

## Best Practices

1. **Use appropriate price ranges** - Match ranges to your trading strategy
2. **Monitor market conditions** - Adjust ranges based on volatility
3. **Consider multiple ranges** - Spread liquidity across price points
4. **Set realistic slippage** - Balance speed with price protection
5. **Always get quotes first** - Understand expected outcomes before trading

## Next Steps

- Learn about [adding DLMM liquidity](tutorial-dlmm-liquidity.md)
- Explore [Rust DLMM development](../rust/quickstart-rust-dlmm.md)
- Check out [advanced DLMM strategies](../docs/README.md)
