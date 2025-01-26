# Lessons Learned Documentation

This is a central reference point for key lessons learned during development. The goal is to prevent repeating mistakes and to build on our existing knowledge.

## Core Documents

- [Main Lessons Learned](../LESSONS_LEARNED.md) - Primary document containing detailed lessons about code reuse, existing solutions, and best practices
- [Architecture Decisions](ARCHITECTURE_DECISIONS.md) - Related document about architectural choices
- [Development Principles](DEVELOPMENT_PRINCIPLES.md) - Core development guidelines

## Key Principles

1. **Check Existing Solutions First**
   - Before creating new code, thoroughly search the codebase
   - Look for similar patterns in related components
   - Review test files for functionality documentation

2. **Document Everything**
   - Write down lessons learned immediately
   - Keep documentation centralized and linked
   - Include examples and specific file references

3. **Build on What Works**
   - Use existing tools and patterns
   - Adapt existing solutions rather than creating new ones
   - Maintain consistency across the codebase

## Quick Reference

Important existing solutions to remember:

1. Chunking System
   - Location: `simple-pdf-processor/src/services/pdf-processor.js`
   - Features: Token limits, context overlap, message boundaries
   - Tests: `simple-pdf-processor/test/smart-chunking.test.js`

2. Directory Analysis
   - Location: `Directory_Analysis/directory_analyzer.py`
   - Purpose: Analyze directory structures without loading everything into memory
   - Pattern: Iterative processing using os.walk()
