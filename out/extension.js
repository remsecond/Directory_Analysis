"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const pdfGeneration_1 = require("./pdfGeneration");
const validator_1 = require("./validator");
const errorHandler_1 = require("./errorHandler");
function activate(context) {
    const pdfGenerator = new pdfGeneration_1.PDFGenerator();
    const validator = new validator_1.WkhtmltopdfValidator();
    const errorHandler = new errorHandler_1.ErrorHandler();
    let disposable = vscode.commands.registerCommand('klein.generatePDF', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        try {
            // Validate wkhtmltopdf installation
            const isValid = await validator.checkAndNotify();
            if (!isValid)
                return;
            const document = editor.document;
            const content = document.getText();
            const outputPath = document.uri.fsPath.replace(/\.\w+$/, '.pdf');
            // Validate content
            await errorHandler.handleContentValidation(content);
            // Validate output path
            await errorHandler.handleOutputPath(outputPath);
            // Generate PDF with progress indication
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Generating PDF...",
                cancellable: false
            }, async () => {
                await pdfGenerator.generatePDF(content, outputPath);
            });
            const openButton = 'Open PDF';
            const action = await vscode.window.showInformationMessage('PDF generated successfully!', openButton);
            if (action === openButton) {
                const uri = vscode.Uri.file(outputPath);
                vscode.env.openExternal(uri);
            }
        }
        catch (error) {
            await errorHandler.handleGenerationError(error);
        }
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map