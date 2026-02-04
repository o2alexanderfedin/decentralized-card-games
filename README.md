# Decentralized Card Games

A blockchain-based card gaming platform enabling decentralized ownership, trading, and gameplay.

## Getting Started

This project uses **git-flow** for version control. All development must follow the git-flow workflow.

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd decentralized-card-games

# Install dependencies (when available)
npm install
```

### Git-Flow Workflow

This repository enforces git-flow through pre-commit hooks.

#### Quick Reference

```bash
# Start new feature
git flow feature start <name>

# Finish feature (merges to develop)
git flow feature finish <name>

# Start release
git flow release start <version>

# Finish release (merges to main, tags version)
git flow release finish <version>

# Start hotfix
git flow hotfix start <version>

# Finish hotfix (merges to main and develop)
git flow hotfix finish <version>
```

#### Important Rules

- ❌ **NO direct commits to `main`** - Pre-commit hook enforces this
- ✅ All features must start with `git flow feature start`
- ✅ All releases go through `release/*` branches
- ✅ Production hotfixes use `hotfix/*` branches

### Branch Structure

- `main` - Production releases only
- `develop` - Integration branch
- `feature/*` - Feature development
- `release/*` - Release preparation
- `hotfix/*` - Production fixes

## Development

Documentation for build, test, and deployment will be added as the project structure is established.

## Contributing

1. Ensure you're on the `develop` branch: `git checkout develop`
2. Pull latest changes: `git pull origin develop`
3. Start a new feature: `git flow feature start your-feature`
4. Make your changes and commit regularly
5. Finish the feature: `git flow feature finish your-feature`
6. Push to develop: `git push origin develop`

## License

TBD
