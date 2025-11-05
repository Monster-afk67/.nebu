'use client';

import type { NebuFile, Tab, Scratchpad } from './types';

const EXPORT_SIGNATURE = 'nebula_board_export_v1';
const SCRATCHPAD_STORAGE_KEY = 'nebula-scratchpads';

/**
 * Exports the current board state (tabs and scratchpads) into a .nebu file format.
 * This function generates a JSON string, creates a Blob, and triggers a download.
 *
 * @param tabs The array of Tab objects to export.
 */
export function exportNebuFile(tabs: Tab[]): { success: boolean; message: string } {
  try {
    let scratchpads: Scratchpad[] = [];
    try {
        const savedScratchpads = localStorage.getItem(SCRATCHPAD_STORAGE_KEY);
        if (savedScratchpads) {
            scratchpads = JSON.parse(savedScratchpads);
        }
    } catch(error) {
        console.warn("Could not load scratchpads for backup", error);
        // We can still proceed with just the tabs
    }

    const exportObject: NebuFile = {
        signature: EXPORT_SIGNATURE,
        timestamp: new Date().toISOString(),
        data: {
            tabs: tabs,
            scratchpads: scratchpads
        },
    };

    const dataStr = JSON.stringify(exportObject, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nebula-board-backup-${new Date().toISOString().split('T')[0]}.nebu`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true, message: 'Export successful.' };
  } catch (error) {
    console.error('Export failed:', error);
    return { success: false, message: error instanceof Error ? error.message : 'An unknown error occurred during export.' };
  }
}

/**
 * Imports a .nebu file, validates its structure, and returns the contained tabs and scratchpads.
 *
 * @param file The file object from a file input.
 * @returns A promise that resolves to an object containing the imported tabs and scratchpads.
 */
export function importNebuFile(file: File): Promise<{ tabs: Tab[], scratchpads: Scratchpad[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('File is not valid text.');
        }
        const restoredObject: NebuFile = JSON.parse(text);

        if (restoredObject.signature !== EXPORT_SIGNATURE) {
            throw new Error('Invalid or unrecognized file format. Expected a .nebu file.');
        }

        const restoredData = restoredObject.data;
        const restoredTabs = restoredData.tabs || [];
        const restoredScratchpads = restoredData.scratchpads || [];

        // Basic validation
        if (!Array.isArray(restoredTabs)) {
            throw new Error('Backup file tab data is corrupted or has an invalid format.');
        }
        if (!Array.isArray(restoredScratchpads)) {
            throw new Error('Backup file scratchpad data is corrupted or has an invalid format.');
        }
        
        resolve({ tabs: restoredTabs, scratchpads: restoredScratchpads });

      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (e) => {
        reject(new Error('Failed to read the file.'));
    }

    reader.readAsText(file);
  });
}

/**
 * Saves the provided scratchpads array to localStorage.
 * @param scratchpads The array of Scratchpad objects to save.
 * @returns An object indicating success or failure.
 */
export function saveScratchpads(scratchpads: Scratchpad[]): { success: boolean, message?: string } {
    try {
        localStorage.setItem(SCRATCHPAD_STORAGE_KEY, JSON.stringify(scratchpads));
        return { success: true };
    } catch (error) {
        console.error("Failed to save scratchpads:", error);
        return { success: false, message: error instanceof Error ? error.message : 'Could not save scratchpads.' };
    }
}
