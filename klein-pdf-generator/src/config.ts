import * as path from 'path';
import * as vscode from 'vscode';

export interface KleinConfig {
    customStylesheet?: string;
}

export function getConfig(): KleinConfig {
    const config = vscode.workspace.getConfiguration('klein');
    return {
        customStylesheet: config.get<string>('customStylesheet') || path.join(__dirname, '../resources/style-template.css')
    };
}
