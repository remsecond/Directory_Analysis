import * as fs from 'fs/promises';
import * as path from 'path';
import { getConfig } from './config';

export async function getStylesheet(): Promise<string> {
    const config = getConfig();
    const stylesheetPath = config.customStylesheet;
    
    if (!stylesheetPath) {
        throw new Error('No stylesheet configured');
    }

    try {
        return await fs.readFile(stylesheetPath, 'utf-8');
    } catch (error) {
        throw new Error(`Failed to read stylesheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
