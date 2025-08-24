# Rust DLMM Quickstart Guide

Get started with building DLMM applications using Rust on Saros.

## Overview

This guide will help you build high-performance DLMM applications using Rust, leveraging the Saros Rust SDK for optimal performance and memory safety.

## Prerequisites

- Rust 1.70+ installed
- Cargo package manager
- Understanding of [DLMM concepts](../dlmm/quickstart-dlmm.md)
- Basic Rust knowledge

## Installation

### Add Dependencies

Add the following to your `Cargo.toml`:

```toml
[dependencies]
saros-dlmm = "0.1.0"
solana-client = "1.17"
solana-sdk = "1.17"
tokio = { version = "1.0", features = ["full"] }
anyhow = "1.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

### Install Rust Dependencies

```bash
cargo build
```

## Basic Setup

### Initialize DLMM Client

```rust
use saros_dlmm::{DlmmClient, DlmmConfig};
use solana_client::rpc_client::RpcClient;
use solana_sdk::signature::{Keypair, Signer};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize RPC client
    let rpc_url = "https://api.mainnet-beta.solana.com".to_string();
    let rpc_client = RpcClient::new(rpc_url);
    
    // Create wallet keypair
    let wallet = Keypair::new();
    
    // Initialize DLMM client
    let config = DlmmConfig {
        rpc_client,
        wallet,
        commitment: solana_sdk::commitment_config::CommitmentConfig::confirmed(),
    };
    
    let client = DlmmClient::new(config)?;
    
    Ok(())
}
```

## Your First DLMM Swap

### Basic Swap Implementation

```rust
use saros_dlmm::{SwapParams, TokenMint};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = setup_client().await?;
    
    // Define swap parameters
    let swap_params = SwapParams {
        input_mint: TokenMint::SOL,
        output_mint: TokenMint::USDC,
        amount: 1_000_000_000, // 1 SOL in lamports
        slippage: 0.5, // 0.5% slippage tolerance
        price_range: Some((90.0, 110.0)), // Price range for concentrated liquidity
    };
    
    // Execute swap
    let swap_result = client.swap(swap_params).await?;
    
    println!("Swap successful: {:?}", swap_result);
    Ok(())
}
```

## Adding Liquidity

### Create Liquidity Position

```rust
use saros_dlmm::{AddLiquidityParams, PriceRange};

async fn add_liquidity(client: &DlmmClient) -> Result<(), Box<dyn std::error::Error>> {
    let liquidity_params = AddLiquidityParams {
        token_a_mint: TokenMint::SOL,
        token_b_mint: TokenMint::USDC,
        token_a_amount: 1_000_000_000, // 1 SOL
        token_b_amount: 20_000_000, // 20 USDC
        price_range: PriceRange {
            lower: 90.0,
            upper: 110.0,
        },
        fee_tier: 0.003, // 0.3% fee tier
    };
    
    let position = client.add_liquidity(liquidity_params).await?;
    println!("Position created: {:?}", position);
    
    Ok(())
}
```

## Managing Positions

### View Positions

```rust
use saros_dlmm::Position;

async fn view_positions(client: &DlmmClient) -> Result<(), Box<dyn std::error::Error>> {
    // Get all positions for the wallet
    let positions = client.get_positions().await?;
    
    for position in positions {
        println!("Position ID: {}", position.id);
        println!("Value: ${:.2}", position.total_value);
        println!("Fees earned: ${:.2}", position.fees_earned);
        println!("Price range: ${:.2} - ${:.2}", 
                position.price_range.lower, position.price_range.upper);
        println!("---");
    }
    
    Ok(())
}
```

### Position Analytics

```rust
use saros_dlmm::PositionAnalytics;

async fn get_position_analytics(client: &DlmmClient, position_id: &str) -> Result<(), Box<dyn std::error::Error>> {
    let analytics = client.get_position_analytics(position_id).await?;
    
    println!("APY: {:.2}%", analytics.apy * 100.0);
    println!("Impermanent loss: {:.2}%", analytics.impermanent_loss * 100.0);
    println!("Fee efficiency: {:.2}", analytics.fee_efficiency);
    
    Ok(())
}
```

## Advanced Features

### Multi-Range Strategies

```rust
use saros_dlmm::{RangeStrategy, RangeWeight};

async fn create_multi_range_strategy(client: &DlmmClient) -> Result<(), Box<dyn std::error::Error>> {
    let ranges = vec![
        RangeWeight {
            range: PriceRange { lower: 85.0, upper: 95.0 },
            weight: 0.3,
        },
        RangeWeight {
            range: PriceRange { lower: 95.0, upper: 105.0 },
            weight: 0.4,
        },
        RangeWeight {
            range: PriceRange { lower: 105.0, upper: 115.0 },
            weight: 0.3,
        },
    ];
    
    let strategy = RangeStrategy { ranges };
    let positions = client.add_liquidity_multi_range(strategy).await?;
    
    println!("Created {} positions", positions.len());
    Ok(())
}
```

### Dynamic Range Adjustment

```rust
use saros_dlmm::MarketConditions;

async fn adjust_ranges_dynamically(client: &DlmmClient, position_id: &str) -> Result<(), Box<dyn std::error::Error>> {
    // Get market conditions
    let market_conditions = client.get_market_conditions().await?;
    
    let new_range = if market_conditions.volatility > 0.1 {
        // High volatility - widen ranges
        PriceRange {
            lower: 85.0,
            upper: 115.0,
        }
    } else {
        // Low volatility - narrow ranges
        PriceRange {
            lower: 95.0,
            upper: 105.0,
        }
    };
    
    // Adjust position
    let result = client.adjust_position(position_id, new_range).await?;
    println!("Position adjusted: {:?}", result);
    
    Ok(())
}
```

## Error Handling

### Comprehensive Error Handling

```rust
use anyhow::{Context, Result};
use saros_dlmm::DlmmError;

async fn robust_swap(client: &DlmmClient) -> Result<(), Box<dyn std::error::Error>> {
    let swap_params = SwapParams {
        input_mint: TokenMint::SOL,
        output_mint: TokenMint::USDC,
        amount: 1_000_000_000,
        slippage: 0.5,
        price_range: Some((90.0, 110.0)),
    };
    
    match client.swap(swap_params).await {
        Ok(result) => {
            println!("Swap successful: {:?}", result);
        }
        Err(DlmmError::InsufficientLiquidity) => {
            eprintln!("Insufficient liquidity in specified range");
        }
        Err(DlmmError::SlippageExceeded) => {
            eprintln!("Slippage tolerance exceeded");
        }
        Err(DlmmError::PriceOutOfRange) => {
            eprintln!("Current price outside specified range");
        }
        Err(e) => {
            eprintln!("Unexpected error: {:?}", e);
        }
    }
    
    Ok(())
}
```

## Performance Optimization

### Batch Operations

```rust
use saros_dlmm::BatchOperation;

async fn batch_operations(client: &DlmmClient) -> Result<(), Box<dyn std::error::Error>> {
    let operations = vec![
        BatchOperation::AddLiquidity(AddLiquidityParams { /* ... */ }),
        BatchOperation::Swap(SwapParams { /* ... */ }),
        BatchOperation::RemoveLiquidity(RemoveLiquidityParams { /* ... */ }),
    ];
    
    let results = client.batch_execute(operations).await?;
    println!("Batch operations completed: {:?}", results);
    
    Ok(())
}
```

### Async Streams for Real-time Data

```rust
use futures::stream::StreamExt;
use saros_dlmm::PositionUpdate;

async fn monitor_positions_realtime(client: &DlmmClient) -> Result<(), Box<dyn std::error::Error>> {
    let mut stream = client.subscribe_position_updates().await?;
    
    while let Some(update) = stream.next().await {
        match update {
            PositionUpdate::ValueChange { position_id, new_value } => {
                println!("Position {} value changed to: ${:.2}", position_id, new_value);
            }
            PositionUpdate::FeeAccrual { position_id, fees } => {
                println!("Position {} earned fees: ${:.2}", position_id, fees);
            }
        }
    }
    
    Ok(())
}
```

## Testing

### Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use saros_dlmm::MockDlmmClient;
    
    #[tokio::test]
    async fn test_swap_execution() {
        let mock_client = MockDlmmClient::new();
        let swap_params = SwapParams { /* ... */ };
        
        let result = mock_client.swap(swap_params).await;
        assert!(result.is_ok());
    }
}
```

## Best Practices

1. **Use async/await** - Leverage Rust's async capabilities for non-blocking operations
2. **Proper error handling** - Use `anyhow` or custom error types for robust error handling
3. **Memory management** - Take advantage of Rust's ownership system for safe memory usage
4. **Batch operations** - Group operations when possible for better performance
5. **Real-time monitoring** - Use streams for continuous position monitoring
6. **Testing** - Write comprehensive tests for your DLMM logic

## Next Steps

- Explore [DLMM swap tutorials](../dlmm/tutorial-dlmm-swap.md)
- Learn about [DLMM liquidity management](../dlmm/tutorial-dlmm-liquidity.md)
- Check out [advanced Rust patterns](../docs/README.md)
- Review [API reference](../reference/)

## Examples

Check out the [examples](../examples/) directory for complete working Rust code.
