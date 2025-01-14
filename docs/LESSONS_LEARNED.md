# Lessons Learned

## Tool Selection & Integration

### PDF Processing
- **What Worked**:
  * pdf-lib for manipulation
  * pdf2json for text extraction
  * Streaming approach for large files
- **What Didn't**:
  * pdf.js in Node environment
  * Multiple PDF libraries competing
  * Memory management with large files
- **Key Lesson**: Choose specialized tools for specific tasks rather than general-purpose libraries

### Google Integration
- **What Worked**:
  * Service account authentication
  * Batch operations for sheets
  * Drive API for file management
- **What Didn't**:
  * OAuth flow in Node environment
  * Multiple credential management
  * Token refresh handling
- **Key Lesson**: Prefer service accounts over OAuth for backend services

### Email Processing
- **What Worked**:
  * MCP server architecture
  * MIME parsing separation
  * Attachment handling isolation
- **What Didn't**:
  * Direct email library integration
  * Complex threading logic
  * Mixed responsibility handlers
- **Key Lesson**: Separate concerns completely, even if it means more services

## Development Patterns

### MCP Server Usage
- **Use When**:
  * Service needs complete isolation
  * Clear input/output contract
  * Independent scaling needed
- **Avoid When**:
  * Simple utility functions
  * Core pipeline components
  * High-performance requirements

### Direct Integration
- **Use When**:
  * Performance critical
  * Core pipeline functionality
  * Tight coupling needed
- **Avoid When**:
  * External service communication
  * Complex state management
  * Multiple consumer support

## Testing Approaches

### What Worked
1. Integration Tests:
   - Mock external services
   - Test real file processing
   - End-to-end scenarios

2. Unit Tests:
   - Core business logic
   - Utility functions
   - Data transformations

### What Didn't
1. Test Structure:
   - Mixed integration/unit tests
   - Unclear test boundaries
   - Missing error scenarios

2. Test Data:
   - Hard-coded test files
   - Inconsistent fixtures
   - Missing edge cases

## Tools That Worked Best

### Development
1. TypeScript:
   - Type safety
   - Interface definitions
   - Code documentation

2. Jest:
   - Fast test execution
   - Good mocking support
   - Clear error reporting

3. ESLint:
   - Consistent code style
   - Error prevention
   - Best practice enforcement

### Infrastructure
1. Docker:
   - Consistent environments
   - Service isolation
   - Easy scaling

2. PM2:
   - Process management
   - Log handling
   - Auto-restart

### Monitoring
1. Winston:
   - Structured logging
   - Multiple transports
   - Good performance

2. Prometheus:
   - Metric collection
   - Alert configuration
   - Dashboard support

## Patterns to Avoid

### 1. Configuration Anti-patterns
- Multiple .env files
- Hardcoded credentials
- Environment-specific code
- Mixed configuration sources

### 2. Integration Anti-patterns
- Direct database access from services
- Synchronous external calls
- Missing timeout handling
- Unclear error boundaries

### 3. Development Anti-patterns
- Multiple implementations of same feature
- Missing interface definitions
- Unclear responsibility boundaries
- Mixed abstraction levels

### 4. Testing Anti-patterns
- Testing implementation details
- Brittle test setups
- Missing error cases
- Inconsistent mocking

## Best Practices Discovered

### 1. Code Organization
- Clear directory structure
- Consistent naming conventions
- Separation of concerns
- Single responsibility principle

### 2. Error Handling
- Centralized error types
- Clear error boundaries
- Proper error propagation
- Meaningful error messages

### 3. Logging
- Structured log format
- Consistent log levels
- Context preservation
- Performance consideration

### 4. Documentation
- Clear API documentation
- Architecture decisions record
- Setup instructions
- Troubleshooting guides

## Integration Insights

### 1. External Services
- Rate limiting implementation
- Retry strategies
- Circuit breaker patterns
- Error categorization

### 2. Internal Services
- Clear contracts
- Version management
- Health checks
- Dependency tracking

## Performance Learnings

### 1. Memory Management
- Streaming large files
- Garbage collection consideration
- Memory leak prevention
- Buffer management

### 2. Processing Optimization
- Batch operations
- Caching strategies
- Async processing
- Resource pooling

## Future Recommendations

### 1. Architecture
- Stronger service boundaries
- Clear integration patterns
- Consistent error handling
- Better configuration management

### 2. Development
- Stricter typing
- Better testing strategy
- Automated documentation
- Performance monitoring

### 3. Operations
- Automated deployment
- Better monitoring
- Clear runbooks
- Incident response plans
