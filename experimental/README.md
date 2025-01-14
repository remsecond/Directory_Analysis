# Experimental Projects

This directory contains experimental features and prototypes that are being developed independently of the core system.

## Git Strategy

### Branching
```
main
└── experimental/
    ├── tagspace/
    │   ├── feature/add-tag-search
    │   └── bugfix/tag-performance
    └── timeline/
        ├── feature/event-extraction
        └── bugfix/date-parsing
```

### Branch Naming
- `experimental/<project-name>/feature/<feature-name>`
- `experimental/<project-name>/bugfix/<bug-name>`
- `experimental/<project-name>/docs/<documentation-name>`

### Pull Requests
1. Create PR against your project's main branch
2. Ensure all tests pass
3. Document integration points
4. Include feature flag configuration

## Project Structure
Each experimental project should follow this structure:
```
experimental/
  your-project/
    src/           # Source code
    test/          # Tests
    scripts/       # Project scripts
    docs/          # Documentation
    README.md      # Project documentation
    INTEGRATION.md # Integration guide
    package.json   # Project dependencies
```

## Development Guidelines

### 1. Independence
- Own package.json
- Independent versioning
- Separate test suite
- Project-specific CI/CD

### 2. Integration Points
- Use feature flags
- Clear interfaces
- Document dependencies
- Performance metrics

### 3. Quality Standards
- TypeScript for type safety
- 80% test coverage
- ESLint configuration
- Documentation

## Getting Started

1. Create new project:
```bash
create-experimental.bat
# Follow prompts
```

2. Development:
```bash
cd experimental/your-project
npm install
npm run dev
```

3. Testing:
```bash
npm test
npm run lint
```

## Integration Process

1. Feature Flag Setup
```typescript
// config/feature-flags.ts
export const FEATURES = {
  experimental: {
    yourProject: {
      enabled: false,
      featureOne: false,
      featureTwo: false
    }
  }
};
```

2. Integration Points
```typescript
// Define clear interfaces
export interface YourService {
  methodOne(): Promise<void>;
  methodTwo(): Promise<Result>;
}

// Use feature flags
if (FEATURES.experimental.yourProject.enabled) {
  // Integration code
}
```

3. Performance Metrics
```typescript
// Monitor performance
const startTime = performance.now();
const result = await yourOperation();
const duration = performance.now() - startTime;

// Log metrics
logger.info('Operation completed', { duration, result });
```

## PR Checklist

- [ ] Tests passing
- [ ] Linting passing
- [ ] Documentation updated
- [ ] Feature flags configured
- [ ] Performance metrics added
- [ ] Integration guide updated

## Best Practices

1. Code Organization
- Clear directory structure
- Consistent naming
- Modular design
- Single responsibility

2. Testing
- Unit tests
- Integration tests
- Performance tests
- Error cases

3. Documentation
- Clear README
- Integration guide
- API documentation
- Performance metrics

4. Integration
- Feature flags
- Clear interfaces
- Performance monitoring
- Rollback plan

Remember: Treat your experimental project like you're a separate engineer who wants to contribute a new feature without breaking the core system.
