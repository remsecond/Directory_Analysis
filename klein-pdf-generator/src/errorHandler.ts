import * as vscode from 'vscode';

export class ErrorHandler {
    static handleError(error: unknown, context: string): void {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        const fullMessage = `${context}: ${errorMessage}`;
        
        // Log error for debugging
        console.error(fullMessage);
        if (error instanceof Error && error.stack) {
            console.error(error.stack);
        }

        // Show error to user
        vscode.window.showErrorMessage(fullMessage);
    }

    static async wrapAsync<T>(
        operation: () => Promise<T>,
        context: string,
        successMessage?: string
    ): Promise<T | undefined> {
        try {
            const result = await operation();
            if (successMessage) {
                vscode.window.showInformationMessage(successMessage);
            }
            return result;
        } catch (error) {
            this.handleError(error, context);
            return undefined;
        }
    }

    static validateCondition(condition: boolean, errorMessage: string): void {
        if (!condition) {
            throw new Error(errorMessage);
        }
    }
}
