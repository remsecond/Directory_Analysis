# Preserved Learnings

This document captures key insights and learnings from our existing codebase that we want to preserve as we move forward with our new experimental structure.

## Architectural Insights

### 1. PDF Processing
- **What Worked**:
  * Streaming approach for large files
  * Memory management strategies
  * Error boundary handling
- **Key Learnings**:
  * Direct file system access is better than in-memory
  * Need clear cleanup strategies
  * Error handling must be comprehensive

### 2. Email Processing
- **What Worked**:
  * MCP server architecture
  * Clear separation of concerns
  * Attachment handling
- **Key Learnings**:
  * Separate services work better for complex I/O
  * Need clear interface contracts
  * Error handling must be distributed

### 3. Google Integration
- **What Worked**:
  * Service account approach
  * Batch operations
  * Clear error boundaries
- **Key Learnings**:
  * Centralize authentication
  * Need robust retry strategies
  * Clear token management

## Technical Decisions

### 1. When to Use MCP
- **Use For**:
  * Complex I/O operations
  * Services that need isolation
  * External integrations
- **Avoid For**:
  * Core pipeline components
  * Performance-critical paths
  * Simple utilities

### 2. When to Use Direct Integration
- **Use For**:
  * Core pipeline components
  * Performance-critical operations
  * Tightly coupled features
- **Avoid For**:
  * External services
  * Complex state management
  * Multi-consumer features

### 3. Configuration Management
- **What We Learned**:
  * Single source of truth
  * Environment validation
  * Clear documentation
  * Feature flag strategy

## Performance Insights

### 1. Memory Management
```typescript
// Good Pattern
const stream = createReadStream(file);
stream.pipe(transformer).pipe(processor);

// Bad Pattern
const content = await readFile(file);
await processContent(content);
```

### 2. Processing Strategy
```typescript
// Good Pattern
class Processor {
  async process(doc: Document): Promise<Result> {
    const chunks = await this.chunk(doc);
    return await Promise.all(chunks.map(this.processChunk));
  }
}

// Bad Pattern
class Processor {
  async process(doc: Document): Promise<Result> {
    const content = await this.readAll(doc);
    return await this.processContent(content);
  }
}
```

## Integration Patterns

### 1. Feature Flags
```typescript
// Good Pattern
if (FEATURES.experimental.tagspace.enabled) {
  await tagProcessor.process(doc);
}

// Bad Pattern
try {
  await tagProcessor.process(doc);
} catch {
  // Fallback
}
```

### 2. Error Boundaries
```typescript
// Good Pattern
class ServiceBoundary {
  async execute<T>(operation: () => Promise<T>): Promise<Result<T>> {
    try {
      const result = await operation();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  }
}

// Bad Pattern
try {
  // Entire service logic here
} catch (error) {
  // Generic error handling
}
```

## Testing Strategies

### 1. Unit Testing
```typescript
// Good Pattern
describe('PDFProcessor', () => {
  it('should handle memory efficiently', async () => {
    const before = process.memoryUsage();
    await processor.process(largeFile);
    const after = process.memoryUsage();
    expect(after.heapUsed - before.heapUsed).toBeLessThan(threshold);
  });
});
```

### 2. Integration Testing
```typescript
// Good Pattern
describe('Integration', () => {
  it('should maintain boundaries', async () => {
    const boundary = new ServiceBoundary();
    const result = await boundary.execute(async () => {
      return await service.process(input);
    });
    expect(result.success).toBe(true);
  });
});
```

## Documentation Insights

### 1. Architecture Documentation
- Clear decision records
- Implementation rationale
- Performance considerations
- Integration guidelines

### 2. Code Documentation
- Clear interfaces
- Error scenarios
- Performance implications
- Integration points

## Future Considerations

### 1. Scalability
- Design for horizontal scaling
- Clear service boundaries
- Stateless where possible
- Resource management

### 2. Maintainability
- Clear ownership
- Documentation standards
- Testing requirements
- Performance metrics

These learnings inform our new experimental structure while preserving the valuable insights gained from our current implementation.
