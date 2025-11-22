# Contributing to Decentralized Green Supply Chain Demo

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/decentralized-green-supplychain-demo.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Run tests: `make test`
6. Run linters: `make lint`
7. Commit your changes: `git commit -m "Add feature: description"`
8. Push to your fork: `git push origin feature/your-feature-name`
9. Open a Pull Request

## Development Setup

Follow the setup instructions in the main README.md:

```bash
make setup
make start-fabric
make start-evm
make start-backend  # in one terminal
make start-frontend # in another terminal
```

## Code Style

### Python (Backend)
- Follow PEP 8
- Use type hints
- Maximum line length: 120 characters
- Run `flake8` before committing

### TypeScript/JavaScript (Frontend & Contracts)
- Follow ESLint rules
- Use TypeScript for frontend
- Maximum line length: 120 characters
- Run `npm run lint` before committing

### Solidity (Contracts)
- Follow Solidity Style Guide
- Use OpenZeppelin contracts when possible
- Run security checks: `npm run security`

## Testing

- Write tests for all new features
- Ensure all tests pass: `make test`
- Aim for >80% code coverage

## Security

- Never commit private keys or sensitive data
- Run security checks: `make lint` (includes Slither/Mythril)
- Review security checklist in README.md

## Pull Request Process

1. Update README.md if needed
2. Add tests for new functionality
3. Ensure all CI checks pass
4. Request review from maintainers
5. Address review comments

## Questions?

Open an issue for questions or discussions.

