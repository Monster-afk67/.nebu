/**
 * This file defines the core data structures for the Nebula application,
 * specifically for the import/export functionality.
 */

/**
 * Represents a single browser tab or a card on the Nebula board.
 */
export interface Tab {
  id: string;
  title: string;
  url: string;
  notes: string;
  tags: string[];
  imageUrl?: string;
  linkedScratchpadId?: string;
}

/**
 * Represents a single scratchpad document.
 */
export interface Scratchpad {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Defines the structure of the .nebu export file.
 * It includes a signature for file validation, a timestamp,
 * and the main data payload.
 */
export interface NebuFile {
  signature: 'nebula_board_export_v1';
  timestamp: string;
  data: {
    tabs: Tab[];
    scratchpads: Scratchpad[];
  };
}
