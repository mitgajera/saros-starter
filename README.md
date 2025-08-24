# Saros Starter

A comprehensive starter kit for building on Saros Protocol - the next-generation DeFi platform on Solana.

## 🚀 What is Saros?

Saros is a decentralized exchange (DEX) and DeFi platform built on Solana that offers:

- **AMM (Automated Market Maker)** - Traditional liquidity pools with efficient trading
- **DLMM (Dynamic Liquidity Market Maker)** - Concentrated liquidity for capital efficiency
- **Staking** - Earn rewards by staking your LP tokens
- **Advanced Trading** - Limit orders, route optimization, and more

## 📚 What's Included

This starter kit provides everything you need to start building on Saros:

### 📖 Documentation
- **Guides** - Step-by-step tutorials for AMM, DLMM, and staking
- **Reference** - Complete API documentation and examples
- **Examples** - Working code samples for all major features

### 🔧 Examples
- **AMM Examples** - Swaps, liquidity provision, and staking
- **DLMM Examples** - Concentrated liquidity and advanced trading
- **Rust Examples** - High-performance implementations

### 🛠️ Development Tools
- TypeScript configuration
- ESLint and Prettier setup
- Jest testing framework
- TypeDoc documentation generation

## 🏗️ Project Structure

```
saros-starter/
├── docs/                   # Main documentation
├── guides/                 # Step-by-step tutorials
│   ├── quickstart-amm.md
│   ├── tutorial-swap.md
│   ├── tutorial-liquidity.md
│   └── tutorial-stake.md
├── dlmm/                   # DLMM-specific guides
│   ├── quickstart-dlmm.md
│   ├── tutorial-dlmm-swap.md
│   └── tutorial-dlmm-liquidity.md
├── rust/                   # Rust development guides
│   └── quickstart-rust-dlmm.md
├── reference/              # API reference
│   ├── typedoc.json
│   └── README.md
├── examples/               # Working code examples
│   ├── amm-swap.ts
│   ├── amm-add-liquidity.ts
│   ├── amm-stake.ts
│   ├── dlmm-quote-swap.ts
│   └── dlmm-add-liquidity.ts
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Solana wallet (Phantom, Solflare, etc.)
- SOL for transaction fees

### Installation

```bash
# Clone the repository
git clone https://github.com/saros-labs/saros-starter.git
cd saros-starter

# Install dependencies
npm install

# Build the project
npm run build
```

### Run Examples

```bash
# Run AMM swap example
npm run example:amm-swap

# Run DLMM liquidity example
npm run example:dlmm-liquidity

# Run all examples
npm run dev
```

## 📖 Learning Path

### 1. Start with AMM (Beginner)
- [Quickstart Guide](docs/guides/quickstart-amm.md) - Get up and running
- [Swap Tutorial](docs/guides/tutorial-swap.md) - Learn to trade tokens
- [Liquidity Tutorial](docs/guides/tutorial-liquidity.md) - Provide liquidity
- [Staking Tutorial](docs/guides/tutorial-stake.md) - Earn rewards

### 2. Explore DLMM (Intermediate)
- [DLMM Quickstart](docs/dlmm/quickstart-dlmm.md) - Understand concentrated liquidity
- [DLMM Swap Tutorial](docs/dlmm/tutorial-dlmm-swap.md) - Advanced trading strategies
- [DLMM Liquidity Tutorial](docs/dlmm/tutorial-dlmm-liquidity.md) - Manage positions

### 3. Build with Rust (Advanced)
- [Rust DLMM Quickstart](docs/rust/quickstart-rust-dlmm.md) - High-performance development

## 🔧 Development

### Available Scripts

```bash
# Build the project
npm run build

# Run in development mode
npm run dev

# Generate API documentation
npm run docs

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

### Code Examples

All examples are located in the `examples/` directory and can be run individually:

```bash
# Run specific examples
npm run example:amm-swap
npm run example:amm-liquidity
npm run example:dlmm-quote
npm run example:dlmm-liquidity
```

## 📚 Documentation

- **API Reference**: Run `npm run docs` to generate the latest API documentation
- **Examples**: Check the `examples/` directory for working code
- **Guides**: Follow the step-by-step tutorials in the `guides/` directory

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.saros.finance](https://docs.saros.finance)
- **Discord**: [Join our community](https://discord.gg/saros)
- **Twitter**: [@SarosFinance](https://twitter.com/SarosFinance)
- **GitHub Issues**: [Report bugs](https://github.com/saros-labs/saros-starter/issues)

## 🙏 Acknowledgments

- Solana Labs for the Solana blockchain
- The DeFi community for inspiration and feedback
- All contributors to the Saros ecosystem

---

**Ready to build the future of DeFi?** 🚀

Start with our [Quickstart Guide](guides/quickstart-amm.md) and join the Saros revolution!
