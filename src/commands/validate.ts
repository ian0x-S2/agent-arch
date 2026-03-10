import { readFileSync, existsSync } from 'fs';

const REQUIRED_SECTIONS = [
  { 
    name: 'Title', 
    patterns: ['# Architecture Policy'] 
  },
  { 
    name: 'Layer Rules', 
    patterns: ['## Layer Rules', '## Layers & Import Direction', '## Structure'] 
  },
  { 
    name: 'Directory Structure', 
    patterns: ['## Directory Structure'] 
  },
  { 
    name: 'File Conventions', 
    patterns: ['## File Conventions'] 
  },
  { 
    name: 'Component Rules', 
    patterns: ['## Component Rules'] 
  },
  { 
    name: 'Svelte 5 Runes', 
    patterns: ['## Svelte 5 Runes'] 
  },
  { 
    name: 'State / Data Flow', 
    patterns: ['## State & Async Rules', '## Data Flow', '## State & Data Flow', '## Publish Contract', '## Forbidden'] 
  },
];

export const validateAction = (filePath: string) => {
  try {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const content = readFileSync(filePath, 'utf8');

    const missing = REQUIRED_SECTIONS.filter(section => {
      return !section.patterns.some(pattern => content.includes(pattern));
    });

    if (missing.length > 0) {
      throw new Error(
        `Missing required sections:\n${missing.map(s => `  - ${s.name} (expected one of: ${s.patterns.join(', ')})`).join('\n')}`
      );
    }

    console.log(`✓ Architecture policy at ${filePath} is valid.`);
  } catch (error) {
    console.error(`✖ Validation failed:`, error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};
