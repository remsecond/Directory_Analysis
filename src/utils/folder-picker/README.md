# Folder Picker Module

Simple Windows native folder picker dialog module.

## Usage

```js
const { getFolderPath } = require('./src/utils/folder-picker');

// Show folder picker dialog and get selected path
const selectedPath = await getFolderPath();

if (selectedPath) {
  console.log('Selected folder:', selectedPath);
} else {
  console.log('No folder selected or dialog cancelled');
}
```

## API

### getFolderPath()

Shows Windows native folder picker dialog and returns selected path.

**Returns:** `Promise<string|null>`
- Returns selected folder path as string
- Returns null if dialog was cancelled or error occurred

## Requirements

- Windows OS (uses Windows shell.application COM object)
- PowerShell available on system PATH

## Notes

- Uses Windows built-in folder picker dialog via PowerShell
- No external dependencies
- Handles cancellation and errors gracefully
- Returns null instead of throwing on errors
