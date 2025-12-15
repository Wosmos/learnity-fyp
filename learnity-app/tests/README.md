# Test Directory Structure

This directory contains all test files organized by category and type.

## Directory Structure

```
tests/
├── unit/                    # Unit tests
│   ├── components/         # Component unit tests
│   ├── hooks/             # Hook unit tests
│   ├── services/          # Service unit tests
│   └── utils/             # Utility unit tests
├── integration/            # Integration tests
│   ├── api/               # API integration tests
│   ├── database/          # Database integration tests
│   └── auth/              # Authentication integration tests
├── e2e/                   # End-to-end tests
│   ├── auth-flow/         # Authentication flow tests
│   ├── user-journey/      # User journey tests
│   └── admin-flow/        # Admin workflow tests
├── scripts/               # Test scripts and utilities
│   ├── database/          # Database testing scripts
│   ├── deployment/        # Deployment testing scripts
│   └── setup/             # Test setup scripts
├── fixtures/              # Test data and fixtures
│   ├── users/             # User test data
│   ├── teachers/          # Teacher test data
│   └── mock-data/         # Mock API responses
├── utils/                 # Test utilities and helpers
│   ├── test-helpers.ts    # Common test helper functions
│   ├── mock-factories.ts  # Mock object factories
│   └── test-setup.ts      # Global test setup
└── docs/                  # Test documentation
    ├── testing-guide.md   # How to run tests
    ├── auth-flow.md       # Authentication testing guide
    └── deployment.md      # Deployment testing guide
```

## Test Categories

### Unit Tests
- Component rendering and behavior
- Hook functionality
- Service methods
- Utility functions

### Integration Tests
- API endpoint testing
- Database operations
- Authentication flows
- Service interactions

### End-to-End Tests
- Complete user workflows
- Cross-browser testing
- Mobile responsiveness
- Performance testing

## Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Utilities

### Mock Factories
- User mock factory
- Teacher profile mock factory
- API response mock factory

### Test Helpers
- Authentication helpers
- Database setup/teardown
- Component testing utilities

## Best Practices

1. **Naming Convention**: Use descriptive test names
2. **Test Structure**: Arrange, Act, Assert pattern
3. **Mocking**: Mock external dependencies
4. **Coverage**: Aim for 80%+ code coverage
5. **Performance**: Keep tests fast and focused