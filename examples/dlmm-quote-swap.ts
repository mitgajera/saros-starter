import {
    LiquidityBookServices,
    MODE,
} from '@saros-finance/dlmm-sdk';
import { PublicKey } from '@solana/web3.js';


const lbs = new LiquidityBookServices({ mode: MODE.MAINNET });


const USDC = { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 };
const C98 = { mint: 'C98A4nkJXhpVZNAZdHUA95RpTF3T4whtQubL3YobiUX9', decimals: 6 };
const PAIR = new PublicKey('EwsqJeioGAXE5EdZHj1QvcuvqgVhJDp9729H5wjh28DD'); // example DLMM pair
const WALLET = new PublicKey('REPLACE_WITH_YOUR_PUBLIC_KEY');

export async function quoteAndSwapC98toUSDC(amountC98: bigint) {
    const quote = await lbs.getQuote({
        amount: amountC98,
        isExactInput: true,
        swapForY: true, // X->Y (C98->USDC)
        pair: PAIR,
        tokenBase: new PublicKey(C98.mint),
        tokenQuote: new PublicKey(USDC.mint),
        tokenBaseDecimal: C98.decimals,
        tokenQuoteDecimal: USDC.decimals,
        slippage: 0.5,
    });


    const { amount, otherAmountOffset } = quote;
    const tx = await lbs.swap({
        amount,
        tokenMintX: new PublicKey(C98.mint),
        tokenMintY: new PublicKey(USDC.mint),
        otherAmountOffset,
        isExactInput: true,
        swapForY: true,
        pair: PAIR,
        payer: WALLET,
    });
    // Sign & send with your wallet adapter or Keypair
    return tx; // Transaction object ready to sign
}
