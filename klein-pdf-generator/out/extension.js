"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const child_process_1 = require("child_process");
function generatePDF(inputFile) {
    return new Promise((resolve, reject) => {
        const outputFile = inputFile.replace(/\.\w+$/, '.pdf');
        // Just the essential options to make links work
        const options = [
            '--enable-external-links',
            '--enable-internal-links',
            inputFile,
            outputFile
        ];
        const pdfProcess = (0, child_process_1.spawn)('wkhtmltopdf', options);
        pdfProcess.on('close', (code) => {
            if (code === 0) {
                resolve();
            }
            else {
                reject(new Error('PDF generation failed'));
            }
        });
    });
}
function activate(context) {
    let disposable = vscode.commands.registerCommand('klein.generatePDF', () => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            try {
                yield generatePDF(editor.document.uri.fsPath);
                vscode.window.showInformationMessage('PDF generated!');
            }
            catch (error) {
                vscode.window.showErrorMessage('PDF generation failed');
            }
        }
    }));
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map