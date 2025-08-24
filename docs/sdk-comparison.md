# Saros SDK Comparison Guide

Choose the right SDK for your project needs and technical requirements.

## 🎯 Quick Decision Matrix

| Feature | @saros-finance/sdk | @saros-finance/dlmm-sdk | saros-dlmm-sdk-rs |
|---------|-------------------|------------------------|-------------------|
| **Use Case** | AMM, Staking, Farming | DLMM Trading | High-performance DLMM |
| **Language** | TypeScript | TypeScript | Rust |
| **Performance** | Good | Better | Best |
| **Learning Curve** | Easy | Medium | Hard |
| **Hackathon Ready** | ✅ Perfect | ✅ Great | ⚠️ Advanced |
| **Production Ready** | ✅ Yes | ✅ Yes | ✅ Yes |

## 📊 Detailed Comparison

### @saros-finance/sdk (TypeScript - AMM, Stake, Farm)

**Best for:**
- 🚀 **Hackathon projects** - Fastest to get started
- 🏦 **Traditional DeFi apps** - AMM swaps, liquidity, staking
- 🎨 **Web3 frontends** - React, Vue, Angular integration
- 📱 **Mobile apps** - Cross-platform compatibility
- 🔧 **Prototyping** - Quick iteration and testing

**Strengths:**
- ✅ **Zero friction** - Familiar TypeScript/JavaScript
- ✅ **Rich ecosystem** - NPM packages, tooling support
- ✅ **Quick setup** - `npm install` and go
- ✅ **Comprehensive** - Covers AMM, staking, and farming
- ✅ **Well documented** - Extensive examples and guides

**Limitations:**
- ⚠️ **Performance** - Not as fast as Rust for high-frequency operations
- ⚠️ **Memory usage** - Higher than Rust for large datasets

**Ideal Project Types:**
- DEX interfaces
- Yield farming dashboards
- Portfolio trackers
- Trading bots (low-frequency)
- Educational tools

---

### @saros-finance/dlmm-sdk (TypeScript - DLMM)

**Best for:**
- 🎯 **Advanced trading** - Concentrated liquidity strategies
- 📈 **Professional tools** - Trading desks, arbitrage bots
- 🔄 **Complex DeFi** - Multi-range liquidity management
- 🚀 **Performance-critical apps** - Where AMM isn't enough

**Strengths:**
- ✅ **DLMM focused** - Specialized for concentrated liquidity
- ✅ **TypeScript** - Familiar language with advanced features
- ✅ **Performance** - Better than general AMM SDK
- ✅ **Advanced features** - Multi-range, limit orders, route optimization
- ✅ **Production ready** - Battle-tested in mainnet

**Limitations:**
- ⚠️ **Complexity** - Steeper learning curve than AMM SDK
- ⚠️ **Specialized** - Only covers DLMM functionality
- ⚠️ **Advanced concepts** - Requires understanding of concentrated liquidity

**Ideal Project Types:**
- Professional trading tools
- Arbitrage bots
- Liquidity management dashboards
- Advanced DeFi protocols
- Market making tools

---

### saros-dlmm-sdk-rs (Rust - DLMM)

**Best for:**
- 🚀 **Maximum performance** - High-frequency trading, MEV bots
- 🏭 **Backend services** - APIs, data processing, analytics
- 🔬 **Research projects** - Algorithm development, testing
- 🎯 **Enterprise solutions** - Where every millisecond counts

**Strengths:**
- ✅ **Best performance** - Native speed, minimal overhead
- ✅ **Memory efficient** - Low memory footprint
- ✅ **Type safety** - Compile-time guarantees
- ✅ **Production grade** - Used by institutional players
- ✅ **Future proof** - Rust ecosystem growing rapidly

**Limitations:**
- ⚠️ **Learning curve** - Rust is more complex than TypeScript
- ⚠️ **Development speed** - Slower iteration for prototypes
- ⚠️ **Ecosystem** - Fewer libraries and tools than TypeScript
- ⚠️ **Hackathon challenge** - May be too complex for time-constrained events

**Ideal Project Types:**
- High-frequency trading bots
- MEV strategies
- Backend APIs
- Data analytics engines
- Institutional tools

## 🚀 Hackathon Recommendations

### 🥇 First Place: @saros-finance/sdk
**Why it's perfect for hackathons:**
- **Setup time**: 5 minutes
- **Learning curve**: 1-2 hours
- **Feature coverage**: 90% of common use cases
- **Documentation**: Extensive guides and examples
- **Community**: Large TypeScript developer base

**Best hackathon ideas:**
- DeFi dashboard with AMM swaps
- Yield farming calculator
- Portfolio tracker
- Social trading platform
- Educational DeFi game

### 🥈 Second Place: @saros-finance/dlmm-sdk
**Why it's great for hackathons:**
- **Setup time**: 10 minutes
- **Learning curve**: 3-4 hours
- **Feature coverage**: Advanced trading features
- **Documentation**: Good coverage with examples
- **Innovation potential**: Unique DLMM capabilities

**Best hackathon ideas:**
- Advanced trading interface
- Liquidity management tool
- Arbitrage opportunity finder
- Multi-range strategy builder
- Professional trading dashboard

### 🥉 Third Place: saros-dlmm-sdk-rs
**Why it's challenging but rewarding:**
- **Setup time**: 20 minutes
- **Learning curve**: 8-12 hours
- **Feature coverage**: Maximum performance
- **Documentation**: Technical but comprehensive
- **Innovation potential**: Highest for performance-critical apps

**Best hackathon ideas:**
- High-performance trading bot
- MEV strategy implementation
- Backend API service
- Data analytics platform
- Performance benchmarking tool

## 🔧 Technical Requirements

### Environment Setup

| SDK | Node.js | Rust | Additional |
|-----|---------|------|------------|
| @saros-finance/sdk | 18+ | ❌ | Solana wallet |
| @saros-finance/dlmm-sdk | 18+ | ❌ | Solana wallet |
| saros-dlmm-sdk-rs | ❌ | 1.70+ | Cargo, Solana wallet |

### Dependencies

```bash
# TypeScript SDKs
npm install @saros-finance/sdk @saros-finance/dlmm-sdk

# Rust SDK
cargo add saros-dlmm-sdk-rs
```

### Development Tools

| SDK | IDE Support | Debugging | Testing |
|-----|-------------|-----------|---------|
| @saros-finance/sdk | ✅ Excellent | ✅ Chrome DevTools | ✅ Jest |
| @saros-finance/dlmm-sdk | ✅ Excellent | ✅ Chrome DevTools | ✅ Jest |
| saros-dlmm-sdk-rs | ✅ Good | ✅ VS Code | ✅ Cargo test |

## 📚 Learning Resources

### @saros-finance/sdk
- [Quickstart Guide](../guides/quickstart-amm.md)
- [Swap Tutorial](../guides/tutorial-swap.md)
- [Liquidity Tutorial](../guides/tutorial-liquidity.md)
- [Staking Tutorial](../guides/tutorial-stake.md)

### @saros-finance/dlmm-sdk
- [DLMM Quickstart](../dlmm/quickstart-dlmm.md)
- [DLMM Swap Tutorial](../dlmm/tutorial-dlmm-swap.md)
- [DLMM Liquidity Tutorial](../dlmm/tutorial-dlmm-liquidity.md)

### saros-dlmm-sdk-rs
- [Rust DLMM Quickstart](../rust/quickstart-rust-dlmm.md)
- [Rust Examples](../examples/)
- [API Reference](../reference/)

## 🎯 Decision Framework

### Choose @saros-finance/sdk if:
- ✅ You're building a hackathon project
- ✅ You need AMM, staking, or farming features
- ✅ You want the fastest development cycle
- ✅ You're comfortable with TypeScript/JavaScript
- ✅ You need comprehensive DeFi functionality

### Choose @saros-finance/dlmm-sdk if:
- ✅ You need advanced trading features
- ✅ You want concentrated liquidity capabilities
- ✅ You're building professional trading tools
- ✅ You're comfortable with complex DeFi concepts
- ✅ You need better performance than AMM

### Choose saros-dlmm-sdk-rs if:
- ✅ You need maximum performance
- ✅ You're building backend services
- ✅ You're comfortable with Rust
- ✅ You have time for a steeper learning curve
- ✅ You're building institutional-grade tools

## 🚀 Getting Started

### Quick Start Commands

```bash
# Clone the starter kit
git clone https://github.com/saros-labs/saros-starter.git
cd saros-starter

# Install dependencies
npm install

# Choose your SDK path:
# 1. AMM/Staking: npm run example:amm-swap
# 2. DLMM: npm run example:dlmm-quote
# 3. Rust: cargo run --example dlmm-swap

# Generate documentation
npm run docs
npm run docs:serve
```

## 🔍 Still Unsure?

**Take our quick quiz:**

1. **What's your timeline?**
   - < 24 hours → @saros-finance/sdk
   - 24-48 hours → @saros-finance/dlmm-sdk
   - > 48 hours → saros-dlmm-sdk-rs

2. **What's your experience level?**
   - Beginner → @saros-finance/sdk
   - Intermediate → @saros-finance/dlmm-sdk
   - Advanced → saros-dlmm-sdk-rs

3. **What's your project type?**
   - Frontend app → @saros-finance/sdk
   - Trading tool → @saros-finance/dlmm-sdk
   - Backend service → saros-dlmm-sdk-rs

**Need help deciding?** Join our [Discord](https://discord.gg/saros) and ask the community!

---

**Ready to build?** Start with our [Quickstart Guide](../guides/quickstart-amm.md) and join the Saros revolution! 🚀
