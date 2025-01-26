import * as vscode from 'vscode';
import { PDFGenerator } from './pdfGenerator';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('klein.generatePDF', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            try {
                const pdfGen = new PDFGenerator();
                await pdfGen.generatePDF(editor.document.uri.fsPath);
                vscode.window.showInformationMessage('PDF generated!');
            } catch (error) {
                if (error instanceof Error) {
                    vscode.window.showErrorMessage(`PDF generation failed: ${error.message}`);
                } else {
                    vscode.window.showErrorMessage('PDF generation failed with unknown error');
                }
            }
        }
    });

    context.subscriptions.push(disposable);
}
