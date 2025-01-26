import * as vscode from 'vscode';
import * as fs from 'fs/promises';

export class PDFGenerationError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = 'PDFGenerationError';
    }
}

export class ErrorHandler {
    async handleOutputPath(outputPath: string): Promise<void> {
        try {
            // Check if file already exists
            try {
                await fs.access(outputPath);
                // File exists, ask for confirmation
                const response = await vscode.window.showWarningMessage(
                    `File ${outputPath} already exists. Do you want to replace it?`,
                    'Replace',
                    'Cancel'
                );
                
                if (response !== 'Replace') {
                    throw new PDFGenerationError('Operation cancelled by user', 'USER_CANCEL');
                }
            } catch (error: unknown) {
                // File doesn't exist, which is fine
                if (error instanceof PDFGenerationError) {
                    throw error;
                }
            }

            // Check write permissions
            try {
                const testPath = `${outputPath}.test`;
                await fs.writeFile(testPath, '');
                await fs.unlink(testPath);
            } catch (error: unknown) {
                throw new PDFGenerationError(
                    'No write permission in the output directory. Please choose a different location.',
                    'NO_WRITE_PERMISSION'
                );
            }
        } catch (error: unknown) {
            if (error instanceof PDFGenerationError) {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new PDFGenerationError(
                `Failed to validate output path: ${errorMessage}`,
                'PATH_VALIDATION_FAILED'
            );
        }
    }

    async handleGenerationError(error: unknown): Promise<void> {
        if (error instanceof PDFGenerationError) {
            switch (error.code) {
                case 'USER_CANCEL':
                    // User cancelled operation, no need for error message
                    return;
                case 'NO_WRITE_PERMISSION':
                    const openFolder = 'Open Folder';
                    const response = await vscode.window.showErrorMessage(
                        error.message,
                        openFolder
                    );
                    if (response === openFolder) {
                        vscode.commands.executeCommand('revealFileInOS', 
                            vscode.Uri.file(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || ''));
                    }
                    return;
                default:
                    vscode.window.showErrorMessage(error.message);
                    return;
            }
        }

        // Handle unknown errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        vscode.window.showErrorMessage(`PDF generation failed: ${errorMessage}`);
    }

    async handleContentValidation(content: string, maxSize: number): Promise<void> {
        if (!content.trim()) {
            throw new PDFGenerationError(
                'Cannot generate PDF from empty document',
                'EMPTY_CONTENT'
            );
        }

        if (content.length > maxSize) {
            const sizeMB = Math.round(maxSize / (1024 * 1024));
            throw new PDFGenerationError(
                `Document is too large to process. Maximum size is ${sizeMB}MB. Please try with a smaller document.`,
                'CONTENT_TOO_LARGE'
            );
        }
    }
}
