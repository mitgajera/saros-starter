# API Reference

This directory contains the complete API reference for the Saros SDK.

## Documentation

- **TypeDoc Configuration**: `typedoc.json` - Configuration for generating API documentation
- **Generated Docs**: Run `npm run docs` to generate the latest API documentation

## API Structure

### Core Modules

- **AMM** - Automated Market Maker functionality
- **DLMM** - Dynamic Liquidity Market Maker
- **Staking** - Liquidity staking and rewards
- **Utilities** - Helper functions and common utilities

### Key Classes

- `SarosClient` - Main client for interacting with Saros
- `AmmClient` - AMM-specific operations
- `DlmmClient` - DLMM-specific operations
- `StakingClient` - Staking operations

## Generating Documentation

```bash
# Install dependencies
npm install

# Generate API documentation
npm run docs

# View documentation
open reference/docs/index.html
```

## API Versioning

The API follows semantic versioning. Check the package.json for the current version and refer to the changelog for migration guides between versions.

## Examples

See the [examples](../examples/) directory for practical usage examples of all API endpoints.
