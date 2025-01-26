# Contributing to PDF Styling System

Thank you for your interest in contributing to our PDF styling system! This document provides guidelines and information for contributors.

## Development Environment Setup

1. Ensure you have the following installed:
   - Node.js 14.x or higher
   - npm 6.x or higher
   - Visual Studio Code (recommended)

2. Clone the repository:
   ```bash
   git clone [repository-url]
   cd pdf-styling-system
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Project Structure

```
.
├── src/                    # Source files
│   ├── pdfGeneration.ts    # PDF generation logic
│   ├── stylesheetHelper.ts # Stylesheet processing
│   └── config.ts          # Configuration handling
├── resources/
│   └── style-template.css  # Default stylesheet
├── test/
│   └── ...                # Test files
└── docs/
    └── ...                # Documentation
```

## Coding Standards

### TypeScript Guidelines

- Use TypeScript for all new code
- Enable strict mode in TypeScript configuration
- Follow the existing code style
- Document public APIs using JSDoc comments

### CSS Guidelines

- Use descriptive class names
- Follow BEM naming convention where applicable
- Maintain backwards compatibility
- Document complex CSS rules
- Test print-specific styles

### Testing

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Include test cases for edge cases
- Test print output manually

## Development Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes:
   - Follow coding standards
   - Update documentation
   - Add tests

3. Test your changes:
   ```bash
   npm test
   ```

4. Commit your changes:
   ```bash
   git commit -m "Description of changes"
   ```

5. Submit a pull request:
   - Provide clear description
   - Reference any related issues
   - Include screenshots if relevant

## Documentation

- Update README.md for user-facing changes
- Document new CSS features in style guide
- Include examples for new functionality
- Update API documentation

## Testing Guidelines

### Unit Tests

- Test individual components
- Mock external dependencies
- Test error conditions
- Verify style applications

### Integration Tests

- Test full PDF generation
- Verify stylesheet loading
- Test different document types
- Validate print output

### Manual Testing

- Test in different browsers
- Verify print preview
- Check PDF output
- Validate responsive behavior

## CSS Contribution Guidelines

### Adding New Styles

1. Identify the category (document structure, links, etc.)
2. Add styles to appropriate section
3. Document the purpose and usage
4. Include print-specific considerations

### Modifying Existing Styles

1. Maintain backwards compatibility
2. Document breaking changes
3. Update examples
4. Test with various content types

### Print Optimization

- Test with different page sizes
- Verify page breaks
- Check link handling
- Validate font rendering

## Pull Request Process

1. Update documentation
2. Add/update tests
3. Ensure CI passes
4. Request review
5. Address feedback
6. Update changelog

## Release Process

1. Version bump
2. Update changelog
3. Create release notes
4. Tag release
5. Update documentation

## Questions?

- Open an issue for feature discussions
- Use pull request comments for code-specific questions
- Check existing issues and documentation first

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
