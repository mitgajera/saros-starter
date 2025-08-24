import sarosSdk, {
    getSwapAmountSaros,
    swapSaros,
    getPoolInfo,
    genConnectionSolana,
} from '@saros-finance/sdk';
import { PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import BN from 'bn.js';

/**
 * Enhanced AMM Swap Example
 * 
 * This example demonstrates comprehensive AMM functionality using the Saros SDK.
 * Features include: quotes, swaps, error handling, and best practices.
 */

// Configuration
const NETWORK = process.env.SOLANA_NETWORK || 'mainnet-beta';
const SLIPPAGE = parseFloat(process.env.SLIPPAGE || '0.5'); // 0.5%

// Token configurations
const TOKENS = {
    SOL: {
        mint: 'So11111111111111111111111111111112',
        addressSPL: 'FXRiEosEvHnpc3XZY1NS7an2PB1SunnYW1f5zppYhXb3',
        decimals: 9,
        symbol: 'SOL'
    },
    USDC: {
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        addressSPL: 'FXRiEosEvHnpc3XZY1NS7an2PB1SunnYW1f5zppYhXb3',
        decimals: 6,
        symbol: 'USDC'
    },
    C98: {
        mint: 'C98A4nkJXhpVZNAZdHUA95RpTF3T4whtQubL3YobiUX9',
        addressSPL: 'EKCdCBjfQ6t5FBfDC2zvmr27PgfVVZU37C8LUE4UenKb',
        decimals: 6,
        symbol: 'C98'
    }
};

// Example pool configurations (replace with actual pool addresses)
const POOLS = {
    'SOL-USDC': {
        address: '2wUvdZA8ZsY714Y5wUL9fkFmupJGGwzui2N74zqJWgty',
        tokens: [TOKENS.SOL, TOKENS.USDC],
        name: 'SOL-USDC Pool'
    },
    'C98-USDC': {
        address: 'EwsqJeioGAXE5EdZHj1QvcuvqgVhJDp9729H5wjh28DD',
        tokens: [TOKENS.C98, TOKENS.USDC],
        name: 'C98-USDC Pool'
    }
};

// Connection management
class SarosConnectionManager {
    private connection: Connection;
    private endpoints: string[];

    constructor(network: string) {
        this.endpoints = this.getEndpoints(network);
        this.connection = new Connection(this.endpoints[0], 'confirmed');
    }

    private getEndpoints(network: string): string[] {
        switch (network) {
            case 'mainnet-beta':
                return [
                    'https://api.mainnet-beta.solana.com',
                    'https://solana-api.projectserum.com',
                    'https://rpc.ankr.com/solana'
                ];
            case 'devnet':
                return ['https://api.devnet.solana.com'];
            case 'testnet':
                return ['https://api.testnet.solana.com'];
            default:
                return ['https://api.mainnet-beta.solana.com'];
        }
    }

    async getConnection(): Promise<Connection> {
        // Health check current connection
        try {
            await this.connection.getLatestBlockhash();
            return this.connection;
        } catch (error) {
            console.log('Primary endpoint failed, trying fallback...');
            return this.getFallbackConnection();
        }
    }

    private async getFallbackConnection(): Promise<Connection> {
        for (const endpoint of this.endpoints.slice(1)) {
            try {
                const connection = new Connection(endpoint, 'confirmed');
                await connection.getLatestBlockhash();
                this.connection = connection;
                console.log(`Connected to fallback endpoint: ${endpoint}`);
                return connection;
            } catch (error) {
                console.log(`Fallback endpoint failed: ${endpoint}`);
                continue;
            }
        }
        throw new Error('All endpoints failed');
    }

    async getBalance(publicKey: string): Promise<number> {
        const connection = await this.getConnection();
        const balance = await connection.getBalance(new PublicKey(publicKey));
        return balance / LAMPORTS_PER_SOL;
    }
}

// Enhanced AMM client
class EnhancedSarosAMM {
    private connectionManager: SarosConnectionManager;

    constructor(network: string) {
        this.connectionManager = new SarosConnectionManager(network);
    }

    /**
     * Get comprehensive quote for a swap
     */
    async getQuote(params: {
        inputToken: string;
        outputToken: string;
        amount: number;
        poolAddress?: string;
    }): Promise<{
        inputAmount: number;
        expectedOutput: number;
        priceImpact: number;
        fee: number;
        poolInfo: any;
        route: string;
    }> {
        try {
            const { inputToken, outputToken, amount, poolAddress } = params;
            
            // Find pool if not specified
            const pool = poolAddress || this.findPool(inputToken, outputToken);
            if (!pool) {
                throw new Error(`No pool found for ${inputToken}-${outputToken}`);
            }

            // Get pool information
            const connection = await this.connectionManager.getConnection();
            const poolInfo = await getPoolInfo(connection, new PublicKey(pool.address));
            
            // Calculate expected output
            const inputTokenInfo = this.getTokenInfo(inputToken);
            const outputTokenInfo = this.getTokenInfo(outputToken);
            
            const amountInWei = this.convertToWei(amount, inputTokenInfo.decimals);
            
            // Get swap quote
            const quote = await getSwapAmountSaros(
                connection,
                inputTokenInfo.mint,
                outputTokenInfo.mint,
                amountInWei,
                SLIPPAGE,
                pool
            );

            // Calculate price impact (simplified)
            const priceImpact = this.calculatePriceImpact(amount, poolInfo);
            
            // Calculate fees (estimated)
            const fee = this.estimateFees(amount, poolInfo);

            return {
                inputAmount: amount,
                expectedOutput: parseFloat(quote.amountOut) / Math.pow(10, outputTokenInfo.decimals),
                priceImpact,
                fee,
                poolInfo,
                route: pool.name
            };

        } catch (error) {
            throw new Error(`Failed to get quote: ${error.message}`);
        }
    }

    /**
     * Execute a swap with comprehensive error handling
     */
    async executeSwap(params: {
        inputToken: string;
        outputToken: string;
        amount: number;
        minOutputAmount?: number;
        poolAddress?: string;
        walletPublicKey: string;
    }): Promise<{
        success: boolean;
        signature?: string;
        error?: string;
        details?: any;
    }> {
        try {
            const { inputToken, outputToken, amount, minOutputAmount, poolAddress, walletPublicKey } = params;
            
            // Validate inputs
            this.validateSwapParams(params);
            
            // Get quote first
            const quote = await this.getQuote({
                inputToken,
                outputToken,
                amount,
                poolAddress
            });

            // Check if output meets minimum requirements
            if (minOutputAmount && quote.expectedOutput < minOutputAmount) {
                throw new Error(`Expected output (${quote.expectedOutput}) below minimum (${minOutputAmount})`);
            }

            // Find pool
            const pool = poolAddress || this.findPool(inputToken, outputToken);
            if (!pool) {
                throw new Error(`No pool found for ${inputToken}-${outputToken}`);
            }

            // Execute swap
            const connection = await this.connectionManager.getConnection();
            const inputTokenInfo = this.getTokenInfo(inputToken);
            const outputTokenInfo = this.getTokenInfo(outputToken);
            
            const amountInWei = this.convertToWei(amount, inputTokenInfo.decimals);
            const minOutputInWei = this.convertToWei(
                minOutputAmount || quote.expectedOutput * 0.99, // 1% buffer if not specified
                outputTokenInfo.decimals
            );

            const swapResult = await swapSaros(
                connection,
                new PublicKey(inputTokenInfo.addressSPL),
                new PublicKey(outputTokenInfo.addressSPL),
                amountInWei,
                minOutputInWei,
                null,
                new PublicKey(pool.address),
                new PublicKey('SSwapUtytfBdBn1b9NUGG6foMVPtcWgpRU32HToDUZr'), // AMM program
                walletPublicKey,
                inputTokenInfo.mint,
                outputTokenInfo.mint
            );

            if ((swapResult as any).isError) {
                throw new Error((swapResult as any).mess || 'Swap failed');
            }

            return {
                success: true,
                signature: (swapResult as any).hash,
                details: {
                    inputAmount: amount,
                    outputAmount: quote.expectedOutput,
                    priceImpact: quote.priceImpact,
                    fee: quote.fee,
                    route: quote.route
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                details: { params, error: error.toString() }
            };
        }
    }

    /**
     * Get pool information and statistics
     */
    async getPoolStats(poolAddress: string): Promise<{
        address: string;
        name: string;
        totalLiquidity: number;
        volume24h: number;
        fees24h: number;
        apy: number;
        tokenBalances: any[];
    }> {
        try {
            const connection = await this.connectionManager.getConnection();
            const poolInfo = await getPoolInfo(connection, new PublicKey(poolAddress));
            
            // Calculate pool statistics
            const totalLiquidity = this.calculateTotalLiquidity(poolInfo);
            const volume24h = this.estimateVolume24h(poolInfo);
            const fees24h = this.estimateFees24h(poolInfo);
            const apy = this.estimateAPY(poolInfo);
            
            return {
                address: poolAddress,
                name: this.getPoolName(poolAddress),
                totalLiquidity,
                volume24h,
                fees24h,
                apy,
                tokenBalances: this.getTokenBalances(poolInfo)
            };

        } catch (error) {
            throw new Error(`Failed to get pool stats: ${error.message}`);
        }
    }

    /**
     * Batch swap multiple tokens
     */
    async batchSwap(swaps: Array<{
        inputToken: string;
        outputToken: string;
        amount: number;
        poolAddress?: string;
    }>, walletPublicKey: string): Promise<{
        success: boolean;
        results: any[];
        errors: any[];
    }> {
        const results = [];
        const errors = [];

        for (let i = 0; i < swaps.length; i++) {
            const swap = swaps[i];
            console.log(`Executing swap ${i + 1}/${swaps.length}: ${swap.inputToken} → ${swap.outputToken}`);
            
            try {
                const result = await this.executeSwap({
                    ...swap,
                    walletPublicKey
                });
                
                if (result.success) {
                    results.push(result);
                    console.log(`✅ Swap ${i + 1} successful: ${result.signature}`);
                } else {
                    errors.push({ index: i, error: result.error, details: result.details });
                    console.log(`❌ Swap ${i + 1} failed: ${result.error}`);
                }
                
                // Add delay between swaps to avoid rate limiting
                if (i < swaps.length - 1) {
                    await this.delay(1000);
                }
                
            } catch (error) {
                errors.push({ index: i, error: error.message });
                console.log(`❌ Swap ${i + 1} failed: ${error.message}`);
            }
        }

        return {
            success: errors.length === 0,
            results,
            errors
        };
    }

    // Helper methods
    private findPool(tokenA: string, tokenB: string): any {
        return Object.values(POOLS).find(pool => 
            pool.tokens.some(t => t.symbol === tokenA) &&
            pool.tokens.some(t => t.symbol === tokenB)
        );
    }

    private getTokenInfo(symbol: string): any {
        const token = Object.values(TOKENS).find(t => t.symbol === symbol);
        if (!token) {
            throw new Error(`Token not found: ${symbol}`);
        }
        return token;
    }

    private convertToWei(amount: number, decimals: number): number {
        return amount * Math.pow(10, decimals);
    }

    private calculatePriceImpact(amount: number, poolInfo: any): number {
        // Simplified price impact calculation
        // In production, this would use actual pool math
        return (amount / 1000000) * 0.1; // 0.1% per $1M
    }

    private estimateFees(amount: number, poolInfo: any): number {
        // Estimate fees based on pool configuration
        return amount * 0.003; // 0.3% fee
    }

    private calculateTotalLiquidity(poolInfo: any): number {
        // Calculate total liquidity in USD
        return 1000000; // Placeholder
    }

    private estimateVolume24h(poolInfo: any): number {
        // Estimate 24h volume
        return 500000; // Placeholder
    }

    private estimateFees24h(poolInfo: any): number {
        // Estimate 24h fees
        return 1500; // Placeholder
    }

    private estimateAPY(poolInfo: any): number {
        // Estimate APY from fees
        return 12.5; // Placeholder
    }

    private getTokenBalances(poolInfo: any): any[] {
        // Get token balances in pool
        return []; // Placeholder
    }

    private getPoolName(poolAddress: string): string {
        const pool = Object.values(POOLS).find(p => p.address === poolAddress);
        return pool ? pool.name : 'Unknown Pool';
    }

    private validateSwapParams(params: any): void {
        if (!params.inputToken || !params.outputToken) {
            throw new Error('Input and output tokens are required');
        }
        if (params.amount <= 0) {
            throw new Error('Amount must be positive');
        }
        if (params.inputToken === params.outputToken) {
            throw new Error('Input and output tokens must be different');
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Example usage and testing
async function main() {
    try {
        console.log('🚀 Starting Enhanced Saros AMM Example...\n');

        // Initialize AMM client
        const amm = new EnhancedSarosAMM(NETWORK);
        console.log(`📡 Connected to ${NETWORK}\n`);

        // Example wallet (replace with actual wallet)
        const WALLET_PUBLIC_KEY = process.env.WALLET_PUBLIC_KEY || 'REPLACE_WITH_YOUR_PUBLIC_KEY';
        
        if (WALLET_PUBLIC_KEY === 'REPLACE_WITH_YOUR_PUBLIC_KEY') {
            console.log('⚠️  Please set WALLET_PUBLIC_KEY environment variable or update the code');
            return;
        }

        // 1. Get quote for SOL to USDC swap
        console.log('📊 Getting quote for SOL → USDC swap...');
        const quote = await amm.getQuote({
            inputToken: 'SOL',
            outputToken: 'USDC',
            amount: 1.0 // 1 SOL
        });

        console.log('✅ Quote received:');
        console.log(`   Input: ${quote.inputAmount} SOL`);
        console.log(`   Expected Output: ${quote.expectedOutput.toFixed(2)} USDC`);
        console.log(`   Price Impact: ${quote.priceImpact.toFixed(2)}%`);
        console.log(`   Estimated Fee: $${quote.fee.toFixed(2)}`);
        console.log(`   Route: ${quote.route}\n`);

        // 2. Execute the swap
        console.log('🔄 Executing swap...');
        const swapResult = await amm.executeSwap({
            inputToken: 'SOL',
            outputToken: 'USDC',
            amount: 1.0,
            minOutputAmount: quote.expectedOutput * 0.99, // 1% slippage tolerance
            walletPublicKey: WALLET_PUBLIC_KEY
        });

        if (swapResult.success) {
            console.log('✅ Swap successful!');
            console.log(`   Transaction: ${swapResult.signature}`);
            console.log(`   Output: ${swapResult.details.outputAmount.toFixed(2)} USDC`);
            console.log(`   Price Impact: ${swapResult.details.priceImpact.toFixed(2)}%`);
        } else {
            console.log('❌ Swap failed:');
            console.log(`   Error: ${swapResult.error}`);
        }

        // 3. Get pool statistics
        console.log('\n📈 Getting pool statistics...');
        const poolStats = await amm.getPoolStats(POOLS['SOL-USDC'].address);
        
        console.log('✅ Pool stats:');
        console.log(`   Pool: ${poolStats.name}`);
        console.log(`   Total Liquidity: $${poolStats.totalLiquidity.toLocaleString()}`);
        console.log(`   24h Volume: $${poolStats.volume24h.toLocaleString()}`);
        console.log(`   24h Fees: $${poolStats.fees24h.toLocaleString()}`);
        console.log(`   APY: ${poolStats.apy.toFixed(2)}%`);

        // 4. Batch swap example
        console.log('\n📦 Executing batch swap...');
        const batchSwaps = [
            { inputToken: 'SOL', outputToken: 'USDC', amount: 0.5 },
            { inputToken: 'USDC', outputToken: 'C98', amount: 100 }
        ];

        const batchResult = await amm.batchSwap(batchSwaps, WALLET_PUBLIC_KEY);
        
        if (batchResult.success) {
            console.log('✅ All batch swaps successful!');
            batchResult.results.forEach((result, index) => {
                console.log(`   Swap ${index + 1}: ${result.signature}`);
            });
        } else {
            console.log('⚠️  Some batch swaps failed:');
            batchResult.errors.forEach(error => {
                console.log(`   Swap ${error.index + 1}: ${error.error}`);
            });
        }

        console.log('\n✨ Enhanced AMM example completed successfully!');

    } catch (error) {
        console.error('❌ Example failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Export for use in other modules
export {
    EnhancedSarosAMM,
    SarosConnectionManager,
    TOKENS,
    POOLS
};

// Run if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}
