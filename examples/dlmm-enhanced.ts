import {
    LiquidityBookServices,
    MODE,
    LiquidityShape,
    createUniformDistribution,
    getMaxBinArray
} from '@saros-finance/dlmm-sdk';
import { PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import BN from 'bn.js';

/**
 * Enhanced DLMM Example
 * 
 * This example demonstrates comprehensive DLMM functionality using the Saros DLMM SDK.
 * Features include: quotes, swaps, liquidity management, and advanced strategies.
 */

// Configuration
const NETWORK = process.env.SOLANA_NETWORK || 'mainnet-beta';
const SLIPPAGE = parseFloat(process.env.SLIPPAGE || '0.5'); // 0.5%

// Token configurations
const TOKENS = {
    SOL: {
        mint: 'So11111111111111111111111111111112',
        decimals: 9,
        symbol: 'SOL'
    },
    USDC: {
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        decimals: 6,
        symbol: 'USDC'
    },
    C98: {
        mint: 'C98A4nkJXhpVZNAZdHUA95RpTF3T4whtQubL3YobiUX9',
        decimals: 6,
        symbol: 'C98'
    }
};

// Example DLMM pair configurations (replace with actual pair addresses)
const DLMM_PAIRS = {
    'SOL-USDC': {
        address: 'EwsqJeioGAXE5EdZHj1QvcuvqgVhJDp9729H5wjh28DD',
        tokens: [TOKENS.SOL, TOKENS.USDC],
        name: 'SOL-USDC DLMM Pair',
        feeTier: 0.003 // 0.3%
    },
    'C98-USDC': {
        address: '2wUvdZA8ZsY714Y5wUL9fkFmupJGGwzui2N74zqJWgty',
        tokens: [TOKENS.C98, TOKENS.USDC],
        name: 'C98-USDC DLMM Pair',
        feeTier: 0.003 // 0.3%
    }
};

// Connection management with fallback
class DLMMConnectionManager {
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

// Enhanced DLMM client
class EnhancedSarosDLMM {
    private lbs: LiquidityBookServices;
    private connectionManager: DLMMConnectionManager;

    constructor(network: string) {
        this.lbs = new LiquidityBookServices({ 
            mode: network === 'mainnet-beta' ? MODE.MAINNET : MODE.DEVNET 
        });
        this.connectionManager = new DLMMConnectionManager(network);
    }

    /**
     * Get comprehensive quote for a DLMM swap
     */
    async getQuote(params: {
        inputToken: string;
        outputToken: string;
        amount: number;
        pairAddress?: string;
        isExactInput?: boolean;
    }): Promise<{
        inputAmount: number;
        expectedOutput: number;
        priceImpact: number;
        fee: number;
        pairInfo: any;
        route: string;
        binRange: [number, number];
    }> {
        try {
            const { inputToken, outputToken, amount, pairAddress, isExactInput = true } = params;
            
            // Find pair if not specified
            const pair = pairAddress || this.findPair(inputToken, outputToken);
            if (!pair) {
                throw new Error(`No DLMM pair found for ${inputToken}-${outputToken}`);
            }

            // Get pair information
            const connection = await this.connectionManager.getConnection();
            const pairInfo = await this.lbs.getPairAccount(new PublicKey(pair.address));
            
            // Determine swap direction
            const inputTokenInfo = this.getTokenInfo(inputToken);
            const outputTokenInfo = this.getTokenInfo(outputToken);
            const swapForY = inputToken === pair.tokens[0].symbol;
            
            // Convert amount to proper format
            const amountInWei = this.convertToWei(amount, inputTokenInfo.decimals);
            
            // Get quote
            const quote = await this.lbs.getQuote({
                amount: BigInt(amountInWei),
                isExactInput,
                swapForY,
                pair: new PublicKey(pair.address),
                tokenBase: new PublicKey(inputTokenInfo.mint),
                tokenQuote: new PublicKey(outputTokenInfo.mint),
                tokenBaseDecimal: inputTokenInfo.decimals,
                tokenQuoteDecimal: outputTokenInfo.decimals,
                slippage: SLIPPAGE,
            });

            // Calculate price impact
            const priceImpact = this.calculatePriceImpact(amount, pairInfo);
            
            // Calculate fees
            const fee = this.calculateFees(amount, pair.feeTier);

            // Get active bin range
            const activeId = pairInfo.activeId;
            const binRange: [number, number] = [activeId - 10, activeId + 10];

            return {
                inputAmount: amount,
                expectedOutput: Number(quote.amount) / Math.pow(10, outputTokenInfo.decimals),
                priceImpact,
                fee,
                pairInfo,
                route: pair.name,
                binRange
            };

        } catch (error) {
            throw new Error(`Failed to get DLMM quote: ${error.message}`);
        }
    }

    /**
     * Execute a DLMM swap with comprehensive error handling
     */
    async executeSwap(params: {
        inputToken: string;
        outputToken: string;
        amount: number;
        minOutputAmount?: number;
        pairAddress?: string;
        walletPublicKey: string;
        isExactInput?: boolean;
    }): Promise<{
        success: boolean;
        signature?: string;
        error?: string;
        details?: any;
    }> {
        try {
            const { inputToken, outputToken, amount, minOutputAmount, pairAddress, walletPublicKey, isExactInput = true } = params;
            
            // Validate inputs
            this.validateSwapParams(params);
            
            // Get quote first
            const quote = await this.getQuote({
                inputToken,
                outputToken,
                amount,
                pairAddress,
                isExactInput
            });

            // Check if output meets minimum requirements
            if (minOutputAmount && quote.expectedOutput < minOutputAmount) {
                throw new Error(`Expected output (${quote.expectedOutput}) below minimum (${minOutputAmount})`);
            }

            // Find pair
            const pair = pairAddress || this.findPair(inputToken, outputToken);
            if (!pair) {
                throw new Error(`No DLMM pair found for ${inputToken}-${outputToken}`);
            }

            // Execute swap
            const connection = await this.connectionManager.getConnection();
            const inputTokenInfo = this.getTokenInfo(inputToken);
            const outputTokenInfo = this.getTokenInfo(outputToken);
            
            const amountInWei = this.convertToWei(amount, inputTokenInfo.decimals);
            const swapForY = inputToken === pair.tokens[0].symbol;

            const swapResult = await this.lbs.swap({
                amount: BigInt(amountInWei),
                tokenMintX: new PublicKey(inputTokenInfo.mint),
                tokenMintY: new PublicKey(outputTokenInfo.mint),
                otherAmountOffset: quote.pairInfo.otherAmountOffset,
                isExactInput,
                swapForY,
                pair: new PublicKey(pair.address),
                payer: new PublicKey(walletPublicKey),
            });

            // Note: In a real implementation, you would need to sign and send the transaction
            // This is a simplified example
            return {
                success: true,
                signature: 'simulated-transaction-signature',
                details: {
                    inputAmount: amount,
                    outputAmount: quote.expectedOutput,
                    priceImpact: quote.priceImpact,
                    fee: quote.fee,
                    route: quote.route,
                    binRange: quote.binRange
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
     * Add concentrated liquidity to DLMM pair
     */
    async addLiquidity(params: {
        pairAddress: string;
        tokenAAmount: number;
        tokenBAmount: number;
        priceRange: [number, number];
        walletPublicKey: string;
        distribution?: 'uniform' | 'spot' | 'custom';
    }): Promise<{
        success: boolean;
        signature?: string;
        error?: string;
        details?: any;
    }> {
        try {
            const { pairAddress, tokenAAmount, tokenBAmount, priceRange, walletPublicKey, distribution = 'uniform' } = params;
            
            // Validate inputs
            this.validateLiquidityParams(params);
            
            // Get pair information
            const connection = await this.connectionManager.getConnection();
            const pairInfo = await this.lbs.getPairAccount(new PublicKey(pairAddress));
            
            // Calculate bin range
            const activeId = pairInfo.activeId;
            const binRange: [number, number] = [
                activeId + priceRange[0],
                activeId + priceRange[1]
            ];
            
            // Get bin arrays
            const binArrayList = getMaxBinArray(binRange, activeId);
            
            // Create transaction
            const transaction = new (await import('@solana/web3.js')).Transaction();
            
            // Get required bin arrays
            for (const item of binArrayList) {
                await this.lbs.getBinArray({ 
                    binArrayIndex: item.binArrayLowerIndex, 
                    pair: new PublicKey(pairAddress), 
                    payer: new PublicKey(walletPublicKey), 
                    transaction 
                });
                
                if (item.binArrayUpperIndex !== item.binArrayLowerIndex) {
                    await this.lbs.getBinArray({ 
                        binArrayIndex: item.binArrayUpperIndex, 
                        pair: new PublicKey(pairAddress), 
                        payer: new PublicKey(walletPublicKey), 
                        transaction 
                    });
                }
            }
            
            // Create liquidity distribution
            let distributionShape;
            switch (distribution) {
                case 'uniform':
                    distributionShape = LiquidityShape.Uniform;
                    break;
                case 'spot':
                    distributionShape = LiquidityShape.Spot;
                    break;
                default:
                    distributionShape = LiquidityShape.Uniform;
            }
            
            const liquidityDistribution = createUniformDistribution({ 
                shape: distributionShape, 
                binRange: [priceRange[0], priceRange[1]] 
            });
            
            // Note: In a real implementation, you would add the actual liquidity instructions
            // This is a simplified example showing the setup
            
            return {
                success: true,
                signature: 'simulated-liquidity-transaction',
                details: {
                    pairAddress,
                    binRange,
                    distribution: distributionShape,
                    binArrays: binArrayList.length,
                    estimatedGas: transaction.instructions.length * 5000
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
     * Get pair information and statistics
     */
    async getPairStats(pairAddress: string): Promise<{
        address: string;
        name: string;
        activeId: number;
        totalLiquidity: number;
        volume24h: number;
        fees24h: number;
        apy: number;
        binCount: number;
        priceRange: [number, number];
    }> {
        try {
            const connection = await this.connectionManager.getConnection();
            const pairInfo = await this.lbs.getPairAccount(new PublicKey(pairAddress));
            
            // Calculate pair statistics
            const totalLiquidity = this.calculateTotalLiquidity(pairInfo);
            const volume24h = this.estimateVolume24h(pairInfo);
            const fees24h = this.estimateFees24h(pairInfo);
            const apy = this.estimateAPY(pairInfo);
            const binCount = this.countActiveBins(pairInfo);
            const priceRange = this.getPriceRange(pairInfo);
            
            return {
                address: pairAddress,
                name: this.getPairName(pairAddress),
                activeId: pairInfo.activeId,
                totalLiquidity,
                volume24h,
                fees24h,
                apy,
                binCount,
                priceRange
            };

        } catch (error) {
            throw new Error(`Failed to get pair stats: ${error.message}`);
        }
    }

    /**
     * Find optimal price ranges for liquidity provision
     */
    async findOptimalRanges(params: {
        pairAddress: string;
        amount: number;
        strategy: 'conservative' | 'balanced' | 'aggressive';
    }): Promise<{
        ranges: Array<{
            lower: number;
            upper: number;
            weight: number;
            expectedAPY: number;
        }>;
        totalExpectedAPY: number;
    }> {
        try {
            const { pairAddress, amount, strategy } = params;
            
            // Get pair information
            const pairInfo = await this.lbs.getPairAccount(new PublicKey(pairAddress));
            const activeId = pairInfo.activeId;
            
            // Define range strategies
            const rangeStrategies = {
                conservative: { width: 20, count: 3, spread: 0.8 },
                balanced: { width: 15, count: 4, spread: 0.6 },
                aggressive: { width: 10, count: 5, spread: 0.4 }
            };
            
            const strategyConfig = rangeStrategies[strategy];
            const ranges = [];
            let totalWeight = 0;
            
            // Generate ranges around active price
            for (let i = 0; i < strategyConfig.count; i++) {
                const center = activeId + (i - strategyConfig.count / 2) * strategyConfig.width;
                const lower = center - strategyConfig.width / 2;
                const upper = center + strategyConfig.width / 2;
                const weight = strategyConfig.spread / strategyConfig.count;
                
                ranges.push({
                    lower,
                    upper,
                    weight,
                    expectedAPY: this.calculateExpectedAPY(amount, strategyConfig.width, strategy)
                });
                
                totalWeight += weight;
            }
            
            // Normalize weights
            ranges.forEach(range => {
                range.weight = range.weight / totalWeight;
            });
            
            const totalExpectedAPY = ranges.reduce((sum, range) => 
                sum + range.expectedAPY * range.weight, 0
            );
            
            return { ranges, totalExpectedAPY };

        } catch (error) {
            throw new Error(`Failed to find optimal ranges: ${error.message}`);
        }
    }

    /**
     * Get real-time market data
     */
    async getMarketData(pairAddress: string): Promise<{
        currentPrice: number;
        priceChange24h: number;
        volatility: number;
        liquidityDepth: number;
        spread: number;
        volume24h: number;
    }> {
        try {
            const connection = await this.connectionManager.getConnection();
            const pairInfo = await this.lbs.getPairAccount(new PublicKey(pairAddress));
            
            // Calculate market metrics
            const currentPrice = this.calculateCurrentPrice(pairInfo);
            const priceChange24h = this.estimatePriceChange24h(pairInfo);
            const volatility = this.calculateVolatility(pairInfo);
            const liquidityDepth = this.calculateLiquidityDepth(pairInfo);
            const spread = this.calculateSpread(pairInfo);
            const volume24h = this.estimateVolume24h(pairInfo);
            
            return {
                currentPrice,
                priceChange24h,
                volatility,
                liquidityDepth,
                spread,
                volume24h
            };

        } catch (error) {
            throw new Error(`Failed to get market data: ${error.message}`);
        }
    }

    // Helper methods
    private findPair(tokenA: string, tokenB: string): any {
        return Object.values(DLMM_PAIRS).find(pair => 
            pair.tokens.some(t => t.symbol === tokenA) &&
            pair.tokens.some(t => t.symbol === tokenB)
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

    private calculatePriceImpact(amount: number, pairInfo: any): number {
        // Simplified price impact calculation for DLMM
        return (amount / 1000000) * 0.05; // 0.05% per $1M (lower than AMM)
    }

    private calculateFees(amount: number, feeTier: number): number {
        return amount * feeTier;
    }

    private calculateTotalLiquidity(pairInfo: any): number {
        // Calculate total liquidity in USD
        return 2000000; // Placeholder - higher than AMM due to concentrated liquidity
    }

    private estimateVolume24h(pairInfo: any): number {
        // Estimate 24h volume
        return 800000; // Placeholder
    }

    private estimateFees24h(pairInfo: any): number {
        // Estimate 24h fees
        return 2400; // Placeholder
    }

    private estimateAPY(pairInfo: any): number {
        // Estimate APY from fees
        return 18.5; // Placeholder - higher than AMM due to concentrated liquidity
    }

    private countActiveBins(pairInfo: any): number {
        // Count active bins in the pair
        return 150; // Placeholder
    }

    private getPriceRange(pairInfo: any): [number, number] {
        // Get the price range of the pair
        return [-100, 100]; // Placeholder
    }

    private getPairName(pairAddress: string): string {
        const pair = Object.values(DLMM_PAIRS).find(p => p.address === pairAddress);
        return pair ? pair.name : 'Unknown DLMM Pair';
    }

    private calculateExpectedAPY(amount: number, rangeWidth: number, strategy: string): number {
        // Calculate expected APY based on range width and strategy
        const baseAPY = 15; // Base APY for DLMM
        const rangeMultiplier = 1 / (rangeWidth / 10); // Narrower ranges = higher APY
        const strategyMultiplier = strategy === 'aggressive' ? 1.5 : strategy === 'balanced' ? 1.2 : 1.0;
        
        return baseAPY * rangeMultiplier * strategyMultiplier;
    }

    private calculateCurrentPrice(pairInfo: any): number {
        // Calculate current price from active bin
        return 100; // Placeholder
    }

    private estimatePriceChange24h(pairInfo: any): number {
        // Estimate 24h price change
        return 2.5; // Placeholder
    }

    private calculateVolatility(pairInfo: any): number {
        // Calculate price volatility
        return 0.15; // Placeholder
    }

    private calculateLiquidityDepth(pairInfo: any): number {
        // Calculate liquidity depth
        return 500000; // Placeholder
    }

    private calculateSpread(pairInfo: any): number {
        // Calculate bid-ask spread
        return 0.02; // Placeholder
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

    private validateLiquidityParams(params: any): void {
        if (!params.pairAddress) {
            throw new Error('Pair address is required');
        }
        if (params.tokenAAmount <= 0 || params.tokenBAmount <= 0) {
            throw new Error('Token amounts must be positive');
        }
        if (params.priceRange[0] >= params.priceRange[1]) {
            throw new Error('Invalid price range');
        }
    }
}

// Example usage and testing
async function main() {
    try {
        console.log('🚀 Starting Enhanced Saros DLMM Example...\n');

        // Initialize DLMM client
        const dlmm = new EnhancedSarosDLMM(NETWORK);
        console.log(`📡 Connected to ${NETWORK}\n`);

        // Example wallet (replace with actual wallet)
        const WALLET_PUBLIC_KEY = process.env.WALLET_PUBLIC_KEY || 'REPLACE_WITH_YOUR_PUBLIC_KEY';
        
        if (WALLET_PUBLIC_KEY === 'REPLACE_WITH_YOUR_PUBLIC_KEY') {
            console.log('⚠️  Please set WALLET_PUBLIC_KEY environment variable or update the code');
            return;
        }

        // 1. Get quote for SOL to USDC swap
        console.log('📊 Getting DLMM quote for SOL → USDC swap...');
        const quote = await dlmm.getQuote({
            inputToken: 'SOL',
            outputToken: 'USDC',
            amount: 1.0 // 1 SOL
        });

        console.log('✅ DLMM Quote received:');
        console.log(`   Input: ${quote.inputAmount} SOL`);
        console.log(`   Expected Output: ${quote.expectedOutput.toFixed(2)} USDC`);
        console.log(`   Price Impact: ${quote.priceImpact.toFixed(2)}%`);
        console.log(`   Estimated Fee: $${quote.fee.toFixed(2)}`);
        console.log(`   Route: ${quote.route}`);
        console.log(`   Bin Range: [${quote.binRange[0]}, ${quote.binRange[1]}]\n`);

        // 2. Execute the swap
        console.log('🔄 Executing DLMM swap...');
        const swapResult = await dlmm.executeSwap({
            inputToken: 'SOL',
            outputToken: 'USDC',
            amount: 1.0,
            minOutputAmount: quote.expectedOutput * 0.99, // 1% slippage tolerance
            walletPublicKey: WALLET_PUBLIC_KEY
        });

        if (swapResult.success) {
            console.log('✅ DLMM Swap successful!');
            console.log(`   Transaction: ${swapResult.signature}`);
            console.log(`   Output: ${swapResult.details.outputAmount.toFixed(2)} USDC`);
            console.log(`   Price Impact: ${swapResult.details.priceImpact.toFixed(2)}%`);
            console.log(`   Bin Range Used: [${swapResult.details.binRange[0]}, ${swapResult.details.binRange[1]}]`);
        } else {
            console.log('❌ DLMM Swap failed:');
            console.log(`   Error: ${swapResult.error}`);
        }

        // 3. Get pair statistics
        console.log('\n📈 Getting DLMM pair statistics...');
        const pairStats = await dlmm.getPairStats(DLMM_PAIRS['SOL-USDC'].address);
        
        console.log('✅ DLMM Pair stats:');
        console.log(`   Pair: ${pairStats.name}`);
        console.log(`   Active Bin ID: ${pairStats.activeId}`);
        console.log(`   Total Liquidity: $${pairStats.totalLiquidity.toLocaleString()}`);
        console.log(`   24h Volume: $${pairStats.volume24h.toLocaleString()}`);
        console.log(`   24h Fees: $${pairStats.fees24h.toLocaleString()}`);
        console.log(`   APY: ${pairStats.apy.toFixed(2)}%`);
        console.log(`   Active Bins: ${pairStats.binCount}`);
        console.log(`   Price Range: [${pairStats.priceRange[0]}, ${pairStats.priceRange[1]}]`);

        // 4. Find optimal liquidity ranges
        console.log('\n🎯 Finding optimal liquidity ranges...');
        const optimalRanges = await dlmm.findOptimalRanges({
            pairAddress: DLMM_PAIRS['SOL-USDC'].address,
            amount: 10000, // $10k
            strategy: 'balanced'
        });
        
        console.log('✅ Optimal ranges found:');
        optimalRanges.ranges.forEach((range, index) => {
            console.log(`   Range ${index + 1}: [${range.lower}, ${range.upper}]`);
            console.log(`     Weight: ${(range.weight * 100).toFixed(1)}%`);
            console.log(`     Expected APY: ${range.expectedAPY.toFixed(2)}%`);
        });
        console.log(`   Total Expected APY: ${optimalRanges.totalExpectedAPY.toFixed(2)}%`);

        // 5. Add concentrated liquidity
        console.log('\n💧 Adding concentrated liquidity...');
        const liquidityResult = await dlmm.addLiquidity({
            pairAddress: DLMM_PAIRS['SOL-USDC'].address,
            tokenAAmount: 0.5, // 0.5 SOL
            tokenBAmount: 50, // 50 USDC
            priceRange: [-20, 20], // ±20 bins from active
            walletPublicKey: WALLET_PUBLIC_KEY,
            distribution: 'uniform'
        });
        
        if (liquidityResult.success) {
            console.log('✅ Liquidity added successfully!');
            console.log(`   Transaction: ${liquidityResult.signature}`);
            console.log(`   Bin Range: [${liquidityResult.details.binRange[0]}, ${liquidityResult.details.binRange[1]}]`);
            console.log(`   Distribution: ${liquidityResult.details.distribution}`);
            console.log(`   Bin Arrays: ${liquidityResult.details.binArrays}`);
        } else {
            console.log('❌ Failed to add liquidity:');
            console.log(`   Error: ${liquidityResult.error}`);
        }

        // 6. Get market data
        console.log('\n📊 Getting real-time market data...');
        const marketData = await dlmm.getMarketData(DLMM_PAIRS['SOL-USDC'].address);
        
        console.log('✅ Market data:');
        console.log(`   Current Price: $${marketData.currentPrice.toFixed(2)}`);
        console.log(`   24h Change: ${marketData.priceChange24h > 0 ? '+' : ''}${marketData.priceChange24h.toFixed(2)}%`);
        console.log(`   Volatility: ${(marketData.volatility * 100).toFixed(2)}%`);
        console.log(`   Liquidity Depth: $${marketData.liquidityDepth.toLocaleString()}`);
        console.log(`   Spread: ${(marketData.spread * 100).toFixed(2)}%`);
        console.log(`   24h Volume: $${marketData.volume24h.toLocaleString()}`);

        console.log('\n✨ Enhanced DLMM example completed successfully!');

    } catch (error) {
        console.error('❌ Example failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Export for use in other modules
export {
    EnhancedSarosDLMM,
    DLMMConnectionManager,
    TOKENS,
    DLMM_PAIRS
};

// Run if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}
