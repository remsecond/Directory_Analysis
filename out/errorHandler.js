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
exports.ErrorHandler = exports.PDFGenerationError = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs/promises"));
class PDFGenerationError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'PDFGenerationError';
    }
}
exports.PDFGenerationError = PDFGenerationError;
class ErrorHandler {
    async handleOutputPath(outputPath) {
        try {
            // Check if file already exists
            try {
                await fs.access(outputPath);
                // File exists, ask for confirmation
                const response = await vscode.window.showWarningMessage(`File ${outputPath} already exists. Do you want to replace it?`, 'Replace', 'Cancel');
                if (response !== 'Replace') {
                    throw new PDFGenerationError('Operation cancelled by user', 'USER_CANCEL');
                }
            }
            catch (error) {
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
            }
            catch (error) {
                throw new PDFGenerationError('No write permission in the output directory. Please choose a different location.', 'NO_WRITE_PERMISSION');
            }
        }
        catch (error) {
            if (error instanceof PDFGenerationError) {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new PDFGenerationError(`Failed to validate output path: ${errorMessage}`, 'PATH_VALIDATION_FAILED');
        }
    }
    async handleGenerationError(error) {
        if (error instanceof PDFGenerationError) {
            switch (error.code) {
                case 'USER_CANCEL':
                    // User cancelled operation, no need for error message
                    return;
                case 'NO_WRITE_PERMISSION':
                    const openFolder = 'Open Folder';
                    const response = await vscode.window.showErrorMessage(error.message, openFolder);
                    if (response === openFolder) {
                        vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || ''));
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
    async handleContentValidation(content) {
        if (!content.trim()) {
            throw new PDFGenerationError('Cannot generate PDF from empty document', 'EMPTY_CONTENT');
        }
        // Check for reasonable content size
        const MAX_CONTENT_SIZE = 10 * 1024 * 1024; // 10MB
        if (content.length > MAX_CONTENT_SIZE) {
            throw new PDFGenerationError('Document is too large to process. Please try with a smaller document.', 'CONTENT_TOO_LARGE');
        }
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=errorHandler.js.map