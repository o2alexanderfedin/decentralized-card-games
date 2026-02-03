# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **decentralized card games** platform, part of a larger decentralized gaming ecosystem. The project enables card game mechanics on blockchain infrastructure.

## Git Workflow - STRICTLY ENFORCED

This repository uses **git-flow** with the main branch as the production branch.

### Branch Structure
- `main` - Production-ready code only (protected)
- `develop` - Integration branch for features
- `feature/*` - New features and enhancements
- `release/*` - Release preparation
- `hotfix/*` - Critical production fixes

### Required Git-Flow Commands

**NEVER commit directly to `main` or unstructured branches.** A pre-commit hook enforces this.

#### Starting New Work
```bash
# Start a new feature
git flow feature start <feature-name>

# Start a release
git flow release start <version>

# Start a hotfix
git flow hotfix start <version>
```

#### Finishing Work
```bash
# Finish a feature (merges to develop)
git flow feature finish <feature-name>

# Finish a release (merges to main and develop, tags release)
git flow release finish <version>

# Finish a hotfix (merges to main and develop, tags hotfix)
git flow hotfix finish <version>
```

#### Daily Workflow
```bash
# Switch to develop and pull latest
git checkout develop
git pull origin develop

# Create feature branch
git flow feature start my-feature

# Work on feature, commit regularly
git add .
git commit -m "feat: implement feature"

# Finish feature when ready
git flow feature finish my-feature

# Push develop
git push origin develop
```

### Commit Enforcement

The pre-commit hook (`.git/hooks/pre-commit`) prevents commits to:
- `main` branch directly
- Any branch not matching git-flow patterns

If you encounter commit errors, ensure you're on a proper git-flow branch.

## Architecture Notes

### Decentralized Gaming Context

This project operates within a decentralized platform, which means:

1. **Blockchain Integration**: Card game state, ownership, and transactions likely interact with smart contracts
2. **Distributed State**: Game state may be stored across decentralized networks
3. **Player Ownership**: Cards and assets are likely NFTs or blockchain-based tokens
4. **Trustless Gameplay**: Game logic must be verifiable and tamper-proof

### Expected Technology Stack

Based on the project path and domain, expect:
- **Smart Contracts**: Solidity/Rust for blockchain logic (card ownership, trades, game rules)
- **Backend**: Node.js/TypeScript for game server, matchmaking, state management
- **Frontend**: React/Next.js for game UI and wallet integration
- **Blockchain**: Ethereum, Polygon, or similar EVM-compatible chain
- **Storage**: IPFS for card assets, decentralized databases for game data

### Key Architectural Considerations

1. **Gas Optimization**: Minimize on-chain operations, batch transactions when possible
2. **State Management**: Hybrid approach - critical state on-chain, gameplay state off-chain with proofs
3. **Security**: All smart contract interactions must be audited, prevent reentrancy and overflow
4. **Player Experience**: Abstract blockchain complexity, provide clear transaction feedback
5. **Scalability**: Use Layer 2 solutions or sidechains for high-frequency game actions

## Development Commands

As the codebase develops, common commands will be added here:

```bash
# Install dependencies (when package.json exists)
npm install

# Run development server
npm run dev

# Build project
npm run build

# Run tests
npm test

# Run single test file
npm test -- <test-file-path>

# Lint code
npm run lint

# Format code
npm run format

# Run local blockchain (if using Hardhat/Foundry)
npm run node

# Deploy smart contracts
npm run deploy

# Compile contracts
npm run compile
```

## Code Organization Principles

When creating the project structure, follow these patterns:

### Smart Contracts
```
/contracts
  /game          # Core game logic contracts
  /tokens        # NFT/token contracts
  /marketplace   # Trading/marketplace contracts
  /interfaces    # Contract interfaces
  /libraries     # Reusable contract libraries
```

### Backend/API
```
/src
  /api           # API routes and controllers
  /services      # Business logic services
  /models        # Data models
  /blockchain    # Blockchain interaction layer
  /utils         # Utility functions
```

### Frontend
```
/app or /pages   # Next.js pages/routes
/components      # React components
  /game          # Game-specific components
  /wallet        # Wallet integration
  /shared        # Shared/common components
/hooks           # React hooks
/lib             # Client libraries
/web3            # Web3 integration utilities
```

## Critical Development Rules

### Smart Contract Development
- **Always** write tests for every contract function
- Use OpenZeppelin contracts for standard functionality
- Follow Checks-Effects-Interactions pattern
- Add NatSpec documentation to all public/external functions
- Run security linters (Slither, Mythril) before deployment
- Never use `tx.origin` for authorization
- Implement pausable patterns for emergency stops

### Type Safety
- Use TypeScript with strict mode enabled
- Define interfaces for all smart contract interactions
- Use ethers.js or viem for type-safe blockchain interactions
- Generate types from smart contract ABIs (use typechain)

### Testing
- Unit test smart contracts with Hardhat/Foundry
- Integration tests for contract interactions
- E2E tests for complete game flows
- Test both happy paths and failure scenarios
- Mock blockchain interactions in frontend tests

### Security
- Never commit private keys or mnemonics
- Use environment variables for sensitive configuration
- Validate all user inputs on-chain and off-chain
- Implement rate limiting for API endpoints
- Use secure randomness (Chainlink VRF) for game mechanics

## Git-Flow Enforcement Details

The pre-commit hook ensures:
- No direct commits to `main`
- All commits must be on `develop`, `feature/*`, `release/*`, or `hotfix/*` branches
- If you attempt to commit on wrong branch, the hook will display proper git-flow commands

To bypass the hook temporarily (NOT RECOMMENDED):
```bash
git commit --no-verify
```

**Only use `--no-verify` in emergency situations and with explicit approval.**
