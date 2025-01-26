import * as vscode from 'vscode';

export interface PDFGeneratorConfig {
    maxContentSizeMB: number;
    defaultOutputDirectory: string | null;
    alwaysPromptForLocation: boolean;
    customStylesheet: string | null;
}

export class ConfigurationManager {
    private readonly configSection = 'kleinPDFGenerator';

    getConfig(): PDFGeneratorConfig {
        const config = vscode.workspace.getConfiguration(this.configSection);
        return {
            maxContentSizeMB: config.get('maxContentSizeMB', 10),
            defaultOutputDirectory: config.get('defaultOutputDirectory', null),
            alwaysPromptForLocation: config.get('alwaysPromptForLocation', false),
            customStylesheet: config.get('customStylesheet', null)
        };
    }

    async promptForOutputLocation(defaultPath: string): Promise<string | undefined> {
        const config = this.getConfig();
        
        if (!config.alwaysPromptForLocation) {
            return defaultPath;
        }

        const uri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file(defaultPath),
            filters: {
                'PDF files': ['pdf']
            },
            title: 'Save PDF As'
        });

        return uri?.fsPath;
    }

    getMaxContentSize(): number {
        const config = this.getConfig();
        return config.maxContentSizeMB * 1024 * 1024; // Convert to bytes
    }

    async getOutputPath(documentPath: string): Promise<string> {
        const config = this.getConfig();
        let outputPath = documentPath.replace(/\.\w+$/, '.pdf');

        if (config.defaultOutputDirectory) {
            const fileName = outputPath.split(/[\\/]/).pop()!;
            outputPath = vscode.Uri.joinPath(
                vscode.Uri.file(config.defaultOutputDirectory),
                fileName
            ).fsPath;
        }

        const finalPath = await this.promptForOutputLocation(outputPath);
        if (!finalPath) {
            throw new Error('No output location selected');
        }

        return finalPath;
    }
}
