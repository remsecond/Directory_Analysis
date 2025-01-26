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
exports.PDFGenerator = void 0;
const vscode = require("vscode");
const child_process_1 = require("child_process");
const errorHandler_1 = require("./errorHandler");
const config_1 = require("./config");
class PDFGenerator {
    generatePDF() {
        return __awaiter(this, void 0, void 0, function* () {
            yield errorHandler_1.ErrorHandler.wrapAsync(() => __awaiter(this, void 0, void 0, function* () {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    throw new Error('No active text editor found');
                }
                const inputFile = editor.document.uri.fsPath;
                const outputFile = inputFile.replace(/\.\w+$/, '.pdf');
                // Validate content size
                const content = editor.document.getText();
                const contentSizeInBytes = Buffer.byteLength(content, 'utf8');
                errorHandler_1.ErrorHandler.validateCondition(config_1.ConfigManager.validateContentSize(contentSizeInBytes), 'Document exceeds maximum size limit');
                // Get custom stylesheet
                const stylesheetPath = config_1.ConfigManager.getConfig().customStylesheet;
                // Build wkhtmltopdf options
                const options = [
                    '--enable-external-links',
                    '--enable-internal-links'
                ];
                if (stylesheetPath) {
                    options.push('--user-style-sheet', stylesheetPath);
                }
                options.push(inputFile, outputFile);
                yield this.runWkhtmltopdf(options);
            }), 'PDF Generation', 'PDF generated successfully!');
        });
    }
    runWkhtmltopdf(options) {
        return new Promise((resolve, reject) => {
            const pdfProcess = (0, child_process_1.spawn)('wkhtmltopdf', options);
            let errorOutput = '';
            pdfProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
                console.error(`wkhtmltopdf error: ${data}`);
            });
            pdfProcess.on('close', (code) => {
                if (code === 0) {
                    resolve();
                }
                else {
                    reject(new Error(`PDF generation failed with code ${code}${errorOutput ? ': ' + errorOutput : ''}`));
                }
            });
            pdfProcess.on('error', (err) => {
                if (err.message.includes('ENOENT')) {
                    reject(new Error('wkhtmltopdf is not installed. Please install it to use this extension.'));
                }
                else {
                    reject(new Error(`Failed to run wkhtmltopdf: ${err.message}`));
                }
            });
        });
    }
}
exports.PDFGenerator = PDFGenerator;
//# sourceMappingURL=pdfGeneration.js.map