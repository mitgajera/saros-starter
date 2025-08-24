# AMM Quickstart Guide

Get started with Automated Market Maker (AMM) functionality on Saros.

## Prerequisites

- Node.js 18+ installed
- A Solana wallet (Phantom, Solflare, etc.)
- SOL for transaction fees

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

## Your First Swap

```typescript
// Swap SOL for USDC
const swapResult = await client.amm.swap({
  inputMint: 'So11111111111111111111111111111112', // SOL
  outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amount: 1000000000, // 1 SOL (in lamports)
  slippage: 0.5 // 0.5% slippage tolerance
});
```

## Next Steps

- Learn about [swaps](../tutorial-swap.md)
- Add [liquidity](../tutorial-liquidity.md)
- [Stake tokens](../tutorial-stake.md)

## Examples

Check out the [examples](../examples/) directory for complete working code.
