# DLMM Quickstart Guide

Get started with Dynamic Liquidity Market Maker (DLMM) on Saros.

## What is DLMM?

DLMM is an advanced liquidity model that provides concentrated liquidity within specific price ranges, offering more efficient capital utilization and better pricing for traders.

## Prerequisites

- Node.js 18+ installed
- A Solana wallet (Phantom, Solflare, etc.)
- SOL for transaction fees
- Understanding of [AMM basics](../guides/quickstart-amm.md)

## Installation

```bash
npm install @saros-labs/sdk
```

## Basic Setup

```typescript
import { SarosClient } from '@saros-labs/sdk';

const client = new SarosClient({
  endpoint: 'https://api.mainnet-beta.solana.com',
  wallet: yourWallet
});
```

## Your First DLMM Swap

```typescript
// Swap using DLMM with concentrated liquidity
const dlmmSwapResult = await client.dlmm.swap({
  inputMint: 'So11111111111111111111111111111112', // SOL
  outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amount: 1000000000, // 1 SOL
  slippage: 0.5, // 0.5% slippage tolerance
  priceRange: {
    lower: 90, // Lower price bound
    upper: 110 // Upper price bound
  }
});

console.log('DLMM swap successful:', dlmmSwapResult);
```

## Key DLMM Concepts

### Concentrated Liquidity

DLMM allows liquidity providers to concentrate their capital within specific price ranges, providing better pricing and higher capital efficiency.

### Price Ranges

- **Narrow ranges**: Higher fees, more capital efficiency
- **Wide ranges**: Lower fees, less capital efficiency but more coverage

### Active Liquidity

Liquidity becomes active when the current price is within your specified range.

## Next Steps

- Learn about [DLMM swaps](tutorial-dlmm-swap.md)
- Add [DLMM liquidity](tutorial-dlmm-liquidity.md)
- Explore [Rust DLMM development](../rust/quickstart-rust-dlmm.md)

## Examples

Check out the [examples](../examples/) directory for complete working DLMM code.
