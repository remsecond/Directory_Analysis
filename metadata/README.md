# Metadata Folder

Central location for all pipeline tracking and logging information.

## Structure
```
metadata/
├── automation/    # Zapier logs and automation tracking
│   ├── daily/    # Daily automation logs
│   └── errors/   # Automation error reports
└── validation/   # Processing validation reports
    ├── success/  # Successful processing logs
    └── failed/   # Failed processing details
```

## Purpose
- Track file movements
- Log processing steps
- Record validation results
- Monitor automation status
- Enable troubleshooting

## Usage
- All logs are timestamped
- JSON format for machine reading
- Human-readable summaries
- Searchable history

## Best Practices
- Don't delete logs
- Use for troubleshooting
- Monitor error patterns
- Regular log rotation
- Backup critical logs
