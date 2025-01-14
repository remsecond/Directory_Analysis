# Experimental Project Template

## Project Structure
```
experimental/
  tagspace/              # Your project directory
    README.md           # Project documentation
    package.json        # Independent dependencies
    tsconfig.json       # Project-specific config
    src/
      index.ts         # Entry point
      types/          # Project types
      services/       # Project services
    test/
      unit/          # Unit tests
      integration/   # Integration tests
    scripts/         # Project scripts
    .env.example     # Environment template
    .gitignore      # Project-specific ignores
```

## Independent Development Guidelines

### 1. Project Independence
- Own package.json
- Independent versioning
- Separate test suite
- Project-specific CI/CD

### 2. Shared Code Usage
```typescript
// Import from shared utilities
import { Logger } from '@evidenceai/shared/utils/logging';
import type { Document } from '@evidenceai/shared/types';

// Do NOT import from core
// ❌ import { PDFProcessor } from '@evidenceai/core/processors';
```

### 3. Integration Points
```typescript
// Define clear interfaces for future integration
export interface TagSpaceProvider {
  addTags(doc: Document, tags: string[]): Promise<void>;
  searchByTag(tag: string): Promise<Document[]>;
}

// Use feature flags for integration
if (FEATURES.experimental.tagspace.enabled) {
  // Integration code here
}
```

## Development Workflow

### 1. Setup New Project
```bash
# Create new project
mkdir experimental/your-project
cd experimental/your-project

# Initialize
npm init
npm install typescript @types/node --save-dev
npm install @evidenceai/shared --save

# Setup TypeScript
npx tsc --init
```

### 2. Development
```bash
# Start development
npm run dev

# Run tests
npm test

# Build
npm run build
```

### 3. Pull Request Guidelines
- All tests must pass
- No core dependencies
- Clear integration points
- Feature flags ready

## Configuration

### 1. package.json
```json
{
  "name": "@evidenceai-experimental/tagspace",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "ts-node-dev src/index.ts",
    "build": "tsc",
    "test": "jest"
  },
  "dependencies": {
    "@evidenceai/shared": "workspace:*"
  }
}
```

### 2. tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

## Testing

### 1. Unit Tests
```typescript
// src/services/__tests__/tag-service.test.ts
import { TagService } from '../tag-service';

describe('TagService', () => {
  it('should add tags to document', async () => {
    const service = new TagService();
    const result = await service.addTags(doc, ['important', 'review']);
    expect(result.tags).toContain('important');
  });
});
```

### 2. Integration Tests
```typescript
// test/integration/tag-search.test.ts
describe('Tag Search Integration', () => {
  it('should find documents by tag', async () => {
    const docs = await searchByTag('important');
    expect(docs.length).toBeGreaterThan(0);
  });
});
```

## Documentation

### 1. README.md
```markdown
# TagSpace Project

## Overview
Experimental feature for document tagging and organization.

## Setup
\`\`\`bash
npm install
npm run dev
\`\`\`

## Testing
\`\`\`bash
npm test
\`\`\`

## Integration
See INTEGRATION.md for details on core integration.
```

### 2. INTEGRATION.md
```markdown
# Integration Guide

## Prerequisites
- Feature flags configured
- Core stability verified
- Performance metrics baseline

## Steps
1. Enable feature flags
2. Implement integration points
3. Run integration tests
4. Monitor performance
```

## Feature Flags

### 1. Configuration
```typescript
// config/feature-flags.ts
export const FEATURES = {
  experimental: {
    tagspace: {
      enabled: false,
      metadata: false,
      search: false
    }
  }
};
```

### 2. Usage
```typescript
// src/services/tag-service.ts
if (FEATURES.experimental.tagspace.metadata) {
  // Implement metadata tagging
}
```

This template ensures:
- Complete independence from core
- Clear integration pathway
- Proper isolation
- Quality standards
- Future maintainability
