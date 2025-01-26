# Repository Setup Guide

## New Repository Creation

### 1. Repository Structure
```
evidence-file-manager/
├── src/
│   ├── core/
│   │   ├── naming/
│   │   ├── deduplication/
│   │   └── storage/
│   ├── services/
│   │   ├── file/
│   │   ├── metadata/
│   │   └── processing/
│   └── utils/
├── test/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── docs/
│   ├── api/
│   ├── deployment/
│   └── guides/
└── scripts/
```

### 2. Initial Files

#### .gitignore
```
# Dependencies
node_modules/
dist/
build/

# Environment
.env
.env.local
.env.*

# Logs
logs/
*.log

# Testing
coverage/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.temp
```

#### package.json
```json
{
  "name": "evidence-file-manager",
  "version": "1.0.0",
  "description": "File management system with deduplication and versioning",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest",
    "lint": "eslint src/",
    "build": "tsc"
  },
  "dependencies": {
    "express": "^4.17.1",
    "typescript": "^4.5.4",
    "pg": "^8.7.1",
    "winston": "^3.3.3"
  },
  "devDependencies": {
    "jest": "^27.4.5",
    "eslint": "^8.5.0",
    "nodemon": "^2.0.15",
    "@types/node": "^16.11.17",
    "@types/jest": "^27.0.3"
  }
}
```

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

### 3. GitHub Repository Setup

1. Create new repository
```bash
git init
git add .
git commit -m "Initial commit: Project structure and base configuration"
git branch -M main
git remote add origin https://github.com/yourusername/evidence-file-manager.git
git push -u origin main
```

2. Branch Protection Rules
- Require pull request reviews
- Require status checks to pass
- Require linear history
- Include administrators in restrictions

### 4. GitHub Actions

#### .github/workflows/ci.yml
```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    
    - name: Use Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16.x'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Run linting
      run: npm run lint
```

### 5. Documentation

#### README.md
```markdown
# Evidence File Manager

File management system with intelligent deduplication and versioning.

## Features
- Automated file naming
- Content-based deduplication
- Format variant handling
- Version tracking
- Multi-user support

## Getting Started
1. Clone repository
2. Install dependencies: `npm install`
3. Configure environment: Copy `.env.example` to `.env`
4. Start development server: `npm run dev`

## Development
- `npm run test`: Run tests
- `npm run lint`: Run linting
- `npm run build`: Build project

## Contributing
See CONTRIBUTING.md for guidelines.

## License
MIT
```

### 6. Development Guidelines

#### CONTRIBUTING.md
```markdown
# Contributing Guidelines

## Code Style
- Use TypeScript
- Follow ESLint configuration
- Write unit tests for new features
- Document public APIs

## Pull Request Process
1. Create feature branch
2. Write tests
3. Update documentation
4. Submit PR with description
5. Address review comments
6. Maintain linear history

## Commit Messages
- Use conventional commits format
- Include ticket number if applicable
- Keep commits focused and atomic
```

### 7. Security

#### .github/workflows/security.yml
```yaml
name: Security Scan

on:
  push:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 0'

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Run security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### 8. Environment Setup

#### .env.example
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=file_manager
DB_USER=admin
DB_PASSWORD=secret

# Storage
STORAGE_PATH=/data/files
TEMP_PATH=/data/temp
BACKUP_PATH=/data/backup

# Security
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=your-encryption-key

# Monitoring
METRICS_PORT=9090
LOG_LEVEL=info
```

## Next Steps

1. Repository Creation
- [ ] Create GitHub repository
- [ ] Set up branch protection
- [ ] Configure GitHub Actions

2. Initial Setup
- [ ] Clone repository
- [ ] Install dependencies
- [ ] Set up development environment

3. Development Start
- [ ] Create initial database schema
- [ ] Implement core services
- [ ] Add unit tests

4. Documentation
- [ ] Complete API documentation
- [ ] Add setup guides
- [ ] Create contribution guidelines
