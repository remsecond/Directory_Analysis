# Architecture Decisions Record

## Core Architecture Decisions

### 1. Document Processing Pipeline

#### Decision: Parallel Processing Implementations
- **What We Did**: Implemented both simple-pdf-processor and src/processors/pdf
- **Why It Failed**: 
  * Created maintenance overhead
  * Confusion about which implementation to use
  * Inconsistent feature sets between implementations
- **Lesson**: Single, well-designed implementation is better than multiple competing ones
- **Go Forward**: Consolidate into single processor with clear boundaries

#### Decision: MCP Server Architecture
- **What Worked**:
  * Clean separation for email processing
  * Modular attachment handling
  * Clear service boundaries
- **What Failed**:
  * Over-application to PDF processing where direct integration would be better
  * Complex setup for simple integrations
- **Lesson**: Use MCP for truly separate services, not for core pipeline components

### 2. Integration Strategies

#### Decision: Google Integration Approach
- **What We Did**: Multiple integration points (Sheets, Drive, OAuth)
- **Why It Failed**:
  * Configuration sprawl across multiple files
  * Inconsistent authentication handling
  * Brittle OAuth implementation
- **Lesson**: Centralize third-party integrations with clear boundaries
- **Go Forward**: Single integration point per external service

#### Decision: LLM Integration
- **What Worked**:
  * Multi-model hub concept
  * Abstracted model interfaces
  * Unified scoring system
- **What Failed**:
  * Too many direct model calls bypassing the hub
  * Inconsistent error handling
- **Go Forward**: Enforce hub pattern for all LLM interactions

### 3. Data Flow Architecture

#### Decision: Document Router Design
- **What Worked**:
  * Central routing point
  * Format-based routing
  * Extensible design
- **What Failed**:
  * Too many bypass routes
  * Inconsistent error handling
  * No clear retry strategy
- **Go Forward**: Strengthen router as single point of entry

### 4. Storage Strategy

#### Decision: Mixed Storage Approach
- **What We Did**: Local storage + Google Sheets + temporary files
- **Why It Failed**:
  * Inconsistent data persistence
  * No clear source of truth
  * Complex synchronization logic
- **Lesson**: Need clear hierarchy of storage systems
- **Go Forward**: Primary storage system with clear backup strategy

## Performance Decisions

### 1. PDF Processing
- **What Worked**:
  * Direct file system access for large files
  * Streaming processing for memory efficiency
- **What Failed**:
  * Memory leaks in long-running processes
  * Blocking operations in main thread
- **Lesson**: Need better resource management

### 2. Chunking Strategy
- **What Worked**:
  * Dynamic chunk sizing
  * Content-aware breaks
- **What Failed**:
  * Inconsistent chunk boundaries
  * Over-optimization for specific models
- **Go Forward**: Standardize chunking with configurable parameters

## Integration Patterns

### 1. External Services
- **Success Pattern**:
  * MCP for standalone services
  * Direct integration for core pipeline
  * Clear error boundaries
- **Anti-Pattern**:
  * Mixed integration styles
  * Unclear responsibility boundaries
  * Duplicate implementations

### 2. Authentication
- **Success Pattern**:
  * Centralized auth management
  * Clear token refresh strategy
  * Environment-based configuration
- **Anti-Pattern**:
  * Scattered credentials
  * Manual OAuth flows
  * Hardcoded secrets

## Testing Strategy

### 1. Test Coverage
- **What Worked**:
  * Unit tests for core logic
  * Integration tests for boundaries
- **What Failed**:
  * Incomplete end-to-end testing
  * Missing error case coverage
- **Go Forward**: Comprehensive test pyramid

### 2. Test Infrastructure
- **What Worked**:
  * Isolated test environments
  * Mock external services
- **What Failed**:
  * Inconsistent mocking strategies
  * Brittle test setups
- **Go Forward**: Standardized test infrastructure

## Configuration Management

### 1. Environment Configuration
- **What Failed**:
  * Multiple .env files
  * Inconsistent naming
  * No validation
- **Go Forward**: 
  * Single source of truth
  * Strong validation
  * Clear documentation

### 2. Feature Flags
- **What Worked**:
  * Granular control
  * Environment-specific flags
- **What Failed**:
  * Too many flags
  * Unclear ownership
- **Go Forward**: Simplified flag system

## Future Considerations

### 1. Scalability
- Design for horizontal scaling
- Clear service boundaries
- Stateless where possible

### 2. Monitoring
- Centralized logging
- Performance metrics
- Error tracking

### 3. Deployment
- Automated deployment pipeline
- Clear rollback procedures
- Environment parity
