#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createProject() {
  console.log('Creating new experimental project...\n');

  // Get project details
  const projectName = await question('Project name (e.g., tagspace): ');
  const description = await question('Short description: ');
  
  const projectDir = path.join(process.cwd(), 'experimental', projectName);

  // Create directory structure
  const dirs = [
    '',
    'src',
    'src/types',
    'src/services',
    'test',
    'test/unit',
    'test/integration',
    'scripts'
  ];

  for (const dir of dirs) {
    await fs.mkdir(path.join(projectDir, dir), { recursive: true });
  }

  // Create package.json
  const packageJson = {
    name: `@evidenceai-experimental/${projectName}`,
    version: '0.1.0',
    private: true,
    description,
    scripts: {
      dev: 'ts-node-dev src/index.ts',
      build: 'tsc',
      test: 'jest',
      'test:watch': 'jest --watch',
      lint: 'eslint src/**/*.ts',
      format: 'prettier --write "src/**/*.ts"'
    },
    dependencies: {
      '@evidenceai/shared': 'workspace:*'
    },
    devDependencies: {
      '@types/jest': '^29.0.0',
      '@types/node': '^18.0.0',
      '@typescript-eslint/eslint-plugin': '^5.0.0',
      '@typescript-eslint/parser': '^5.0.0',
      'eslint': '^8.0.0',
      'jest': '^29.0.0',
      'prettier': '^2.0.0',
      'ts-jest': '^29.0.0',
      'ts-node-dev': '^2.0.0',
      'typescript': '^4.0.0'
    }
  };

  await fs.writeFile(
    path.join(projectDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'ESNext',
      moduleResolution: 'node',
      esModuleInterop: true,
      strict: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      outDir: './dist',
      rootDir: './src',
      paths: {
        '@evidenceai/shared/*': ['../../shared/*']
      }
    },
    include: ['src/**/*'],
    exclude: ['node_modules', '**/*.test.ts']
  };

  await fs.writeFile(
    path.join(projectDir, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );

  // Create README.md
  const readme = `# ${projectName}

${description}

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
`;

  await fs.writeFile(path.join(projectDir, 'README.md'), readme);

  // Create INTEGRATION.md
  const integration = `# Integration Guide

## Prerequisites
- Feature flags configured
- Core stability verified
- Performance metrics baseline

## Steps
1. Enable feature flags
2. Implement integration points
3. Run integration tests
4. Monitor performance
`;

  await fs.writeFile(path.join(projectDir, 'INTEGRATION.md'), integration);

  // Create sample files
  const indexTs = `import { Logger } from '@evidenceai/shared/utils/logging';

const logger = new Logger('${projectName}');

export async function initialize() {
  logger.info('Initializing ${projectName}...');
}
`;

  await fs.writeFile(path.join(projectDir, 'src/index.ts'), indexTs);

  // Create .gitignore
  const gitignore = `node_modules/
dist/
coverage/
.env
*.log
`;

  await fs.writeFile(path.join(projectDir, '.gitignore'), gitignore);

  // Create .env.example
  const envExample = `# ${projectName.toUpperCase()}_CONFIG=value
`;

  await fs.writeFile(path.join(projectDir, '.env.example'), envExample);

  // Create sample test
  const testFile = `import { initialize } from '../src/index';

describe('${projectName}', () => {
  it('should initialize without errors', async () => {
    await expect(initialize()).resolves.not.toThrow();
  });
});
`;

  await fs.writeFile(
    path.join(projectDir, 'test/unit/index.test.ts'),
    testFile
  );

  // Initialize git
  execSync('git init', { cwd: projectDir });

  console.log(`
Project created successfully!

To get started:
cd experimental/${projectName}
npm install
npm run dev

See README.md for more details.
`);

  rl.close();
}

createProject().catch(console.error);
