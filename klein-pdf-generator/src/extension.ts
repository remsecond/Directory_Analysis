import * as vscode from 'vscode';
import { spawn } from 'child_process';

function generatePDF(inputFile: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const outputFile = inputFile.replace(/\.\w+$/, '.pdf');
        
        // Just the essential options to make links work
        const options = [
            '--enable-external-links',
            '--enable-internal-links',
            inputFile,
            outputFile
        ];

        const pdfProcess = spawn('wkhtmltopdf', options);
        
        pdfProcess.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error('PDF generation failed'));
            }
        });
    });
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('klein.generatePDF', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            try {
                await generatePDF(editor.document.uri.fsPath);
                vscode.window.showInformationMessage('PDF generated!');
            } catch (error) {
                vscode.window.showErrorMessage('PDF generation failed');
            }
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
