# EvidenceAI Documentation

## Core Documentation

### 1. [ARCHITECTURE_DECISIONS.md](./ARCHITECTURE_DECISIONS.md)
- Documents key architectural decisions
- Explains what worked and what didn't
- Provides rationale for future choices
- Captures architectural evolution

### 2. [LESSONS_LEARNED.md](./LESSONS_LEARNED.md)
- Practical implementation insights
- Tool selection guidance
- Integration patterns
- Development practices

### 3. [REBUILD_STRATEGY.md](./REBUILD_STRATEGY.md)
- Phased rebuild approach
- Clear timelines
- Success criteria
- Risk management

### 4. [REBUILD_STARTING_POINT.md](./REBUILD_STARTING_POINT.md)
- Initial implementation
- Core architecture
- Project structure
- First steps

## Innovation & Progress

### 5. [INNOVATION_MANAGEMENT.md](./INNOVATION_MANAGEMENT.md)
- Innovation sandbox structure
- Experimental features
- Integration pathway
- Risk mitigation

### 6. [PROGRESS_TRACKING.md](./PROGRESS_TRACKING.md)
- Core stability metrics
- Innovation health checks
- Weekly review template
- Decision framework

## Using This Documentation

### For Core Development
1. Start with ARCHITECTURE_DECISIONS.md
2. Review LESSONS_LEARNED.md
3. Follow REBUILD_STRATEGY.md
4. Use REBUILD_STARTING_POINT.md

### For Innovation Projects
1. Review INNOVATION_MANAGEMENT.md
2. Follow experimental guidelines
3. Track using PROGRESS_TRACKING.md
4. Plan integration carefully

### For Project Management
1. Use PROGRESS_TRACKING.md
2. Monitor core vs. innovation
3. Make data-driven decisions
4. Maintain stability focus

## Key Principles

### 1. Stability First
- Core functionality must be solid
- Clear success metrics
- Regular health checks
- Performance monitoring

### 2. Controlled Innovation
- Isolated experiments
- Clear boundaries
- Measured integration
- Value validation

### 3. Linear Progress
- One implementation at a time
- Clear success criteria
- Documented decisions
- Measured outcomes

### 4. Knowledge Preservation
- Document decisions
- Capture learnings
- Share insights
- Build on experience

## Project Structure

```
evidenceai/
  core/           # Stable core features
    src/
    test/
    
  experimental/   # Innovation sandbox
    tagspace/
    timeline/
    concepts/
    
  shared/         # Shared utilities
    types/
    utils/
    
  docs/           # Documentation
    *.md
```

## Getting Started

1. Core Development:
   ```bash
   cd core
   npm install
   npm test
   ```

2. Innovation Projects:
   ```bash
   cd experimental/<project>
   npm install
   npm test
   ```

3. Documentation Updates:
   ```bash
   # Update relevant .md files
   # Follow documentation guidelines
   # Keep decisions recorded
   ```

## Next Steps

1. Review current status in PROGRESS_TRACKING.md
2. Follow rebuild plan in REBUILD_STRATEGY.md
3. Start implementation using REBUILD_STARTING_POINT.md
4. Manage innovations using INNOVATION_MANAGEMENT.md

This documentation set provides a complete framework for:
- Building stable core features
- Managing innovation safely
- Tracking progress effectively
- Making informed decisions
- Preserving knowledge
- Maintaining focus
