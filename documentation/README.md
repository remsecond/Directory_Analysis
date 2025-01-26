So # Documentation Management

This folder contains the consolidated documentation for the EvidenceAI project. The documentation is automatically gathered from various parts of the project and synchronized to both GitHub and Google Drive.

## When to Run sync-docs.bat

Run `sync-docs.bat` at the end of your work session when you have:
- Made documentation changes
- Created new documentation files
- Updated existing documentation
- Want to make documentation available to LLMs

This is a session-end task - think of it as your "documentation commit" that makes all your changes available in all the right places.

## What sync-docs.bat Does

The script performs three steps:
1. Consolidates documentation from all project directories into this folder
2. Commits and pushes to GitHub (for version control and context)
3. Syncs to Google Drive (for LLM access)

## Source Directories

Documentation is gathered from:
- docs/
- simple-pdf-processor/
- Directory_Analysis/
- src/mcp/
- evidenceai-cloud/docs/

## Organization

The documentation is organized into:
- /current/ - Current, actively maintained documentation
- /archive/ - Historical documentation for reference

## Best Practices

1. Make all your documentation changes in the source locations
2. Run sync-docs.bat when you're done with your changes
3. Don't edit files directly in this folder - they'll be overwritten by the consolidation process
