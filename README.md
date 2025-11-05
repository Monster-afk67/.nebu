# Nebula Board Handler

This library provides functions to handle the import and export of Nebula board data using the custom `.nebu` file format.

## Features

- **Export**: Serializes the board state (tabs and scratchpads) into a versioned JSON format and triggers a download.
- **Import**: Parses a `.nebu` file, validates its signature, and returns the structured data.
- **Type Definitions**: Includes TypeScript types for all data structures.

## Usage

### Exporting a Board

To export the user's current board:

```typescript
import { exportNebuFile } from './index';
import type { Tab } from './types';

const currentTabs: Tab[] = [
  // ... user's tab data
];

const result = exportNebuFile(currentTabs);

if (result.success) {
  console.log(result.message); // "Export successful."
} else {
  console.error(result.message);
}
```
*Note: The `exportNebuFile` function automatically retrieves scratchpads from `localStorage`.*

### Importing a Board

To import data from a user-provided `.nebu` file:

```typescript
import { importNebuFile, saveScratchpads } from './index';
import type { Tab, Scratchpad } from './types';

const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const { tabs, scratchpads } = await importNebuFile(file);

    // Now, update your application's state with the imported data
    // setStateForTabs(tabs);
    // saveScratchpads(scratchpads);

    console.log('Import successful!');
  } catch (error) {
    console.error('Import failed:', error.message);
  }
};
```

### Data Structures

The library uses the following core types, defined in `types.ts`:

- `Tab`
- `Scratchpad`
- `NebuFile` (The structure of the `.nebu` file itself)

This self-contained structure allows the logic to be easily published as a standalone NPM package.
