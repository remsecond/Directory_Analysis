# Core Components Guide

This document outlines the key components and capabilities of the EvidenceAI system, serving as a technical reference for the development team.

## Directory Analysis System

### Overview
The directory analysis system provides metadata-level analysis of file structures without loading entire contents into memory.

#### Implementation: `Directory_Analysis/directory_analyzer.py`
- File type distribution analysis
- Pattern recognition in file naming
- Duplicate identification
- JSON report generation
- Logging and error handling

```python
# Example Usage
analyzer = DirectoryAnalyzer()
report_path = analyzer.analyze_directory(target_dir)
```

## Content Processing System

### Overview
The content processing system handles intelligent text analysis with advanced chunking capabilities.

#### Implementation: `simple-pdf-processor/src/services/pdf-processor.js`

1. Smart Token Management
   - Maximum limit: 25,000 tokens per chunk
   - Target size: 150 tokens with 50% tolerance
   - Minimum overlap: 50 tokens between chunks (verified)

2. Format-Specific Processing
   - OFW format: Enforces "Message X of Y" headers
   - Email format: Requires Subject/From/To/Date headers
   - Continuation chunks: Tracked via metadata
   - Line-aware splitting

3. Context Preservation
   - Minimum 50 tokens overlap between chunks
   - Text-level verification
   - Minimum 10 character meaningful overlap
   - Uses 3.2 chars/token estimation

```javascript
// Example Usage
const chunks = pdfProcessor.createChunks(content, 'email');
```

## When to Use Each Component

### Directory Analysis
- Initial repository assessment
- Storage analysis
- File organization
- Duplicate detection
- No content reading needed

### Content Processing
- Document content analysis
- Text processing
- Semantic understanding
- Context-aware operations
- Large file handling

## Integration Points

### Directory Analysis → Content Processing
1. Use directory analysis first to:
   - Identify relevant files
   - Detect duplicates
   - Plan processing strategy

2. Then use content processing to:
   - Analyze identified files
   - Process in chunks
   - Maintain context

## Best Practices

1. Repository Analysis
   - Clone repositories locally first
   - Use directory analysis for structure
   - Plan content processing strategy

2. Content Analysis
   - Respect file format boundaries
   - Maintain context through overlaps
   - Verify chunk relationships

3. Error Handling
   - Log all operations
   - Verify file access
   - Handle format-specific edge cases

## Future Enhancements

1. Enhanced Analysis
   - Machine learning classification
   - Pattern recognition
   - Content-based categorization

2. Integration Capabilities
   - API development
   - External system hooks
   - Workflow automation

## Technical Reference

### Directory Analyzer Output
```json
{
  "analysis_timestamp": "20240126_092832",
  "summary": {
    "total_files": 2555,
    "unique_file_types": 15,
    "potential_duplicates": 122
  }
}
```

### Content Processor Output
```javascript
{
  text: string,
  metadata: {
    length: number,
    word_count: number,
    estimated_tokens: number,
    overlap_tokens: number,
    continues_from?: number
  }
}
```

## Support and Resources

### Documentation
- Source code comments
- Test files (smart-chunking.test.js)
- Implementation examples

### Tools
- Directory analysis utilities
- Content processing scripts
- Testing frameworks

## Conclusion

These core components provide a robust foundation for file analysis and content processing, with clear separation of concerns between structure analysis and content processing. The system is designed for extensibility and can be enhanced with additional capabilities as needed.
