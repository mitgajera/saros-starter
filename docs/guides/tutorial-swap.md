# Swap Tutorial

Learn how to perform token swaps using Saros AMM.

## Overview

Swapping tokens on Saros allows you to exchange one token for another at the best available rate using our automated market maker.

## Prerequisites

- Complete the [Quickstart Guide](quickstart-amm.md)
- Have tokens in your wallet for swapping

## Basic Swap

```typescript
import { SarosClient } from '@saros-labs/sdk';

const client = new SarosClient({
  endpoint: 'https://api.mainnet-beta.solana.com',
  wallet: yourWallet
});

// Perform a swap
const swapResult = await client.amm.swap({
  inputMint: 'So11111111111111111111111111111112', // SOL
  outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amount: 1000000000, // 1 SOL
  slippage: 0.5 // 0.5% slippage tolerance
});

console.log('Swap successful:', swapResult);
```

## Advanced Swap Options

### Setting Slippage Tolerance

```typescript
// Conservative slippage for stable pairs
const conservativeSwap = await client.amm.swap({
  inputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  outputMint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  amount: 1000000, // 1 USDC
  slippage: 0.1 // 0.1% slippage tolerance
});
```

### Getting Quote Before Swap

```typescript
// Get quote first
const quote = await client.amm.getQuote({
  inputMint: 'So11111111111111111111111111111112',
  outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  amount: 1000000000
});

console.log('Expected output:', quote.expectedOutputAmount);
console.log('Price impact:', quote.priceImpact);
```

## Error Handling

```typescript
try {
  const swapResult = await client.amm.swap({
    inputMint: 'So11111111111111111111111111111112',
    outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    amount: 1000000000,
    slippage: 0.5
  });
} catch (error) {
  if (error.message.includes('insufficient balance')) {
    console.log('Insufficient token balance');
  } else if (error.message.includes('slippage exceeded')) {
    console.log('Slippage tolerance exceeded');
  }
}
```

## Best Practices

1. **Always check quotes first** - Use `getQuote()` to understand the expected output
2. **Set appropriate slippage** - Lower for stable pairs, higher for volatile pairs
3. **Handle errors gracefully** - Implement proper error handling for user experience
4. **Monitor transaction status** - Check transaction confirmation

## Next Steps

- Learn about [adding liquidity](tutorial-liquidity.md)
- Explore [staking opportunities](tutorial-stake.md)
- Check out [DLMM functionality](../dlmm/quickstart-dlmm.md)
