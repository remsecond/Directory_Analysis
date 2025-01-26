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
exports.ErrorHandler = void 0;
const vscode = require("vscode");
class ErrorHandler {
    static handleError(error, context) {
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
    static wrapAsync(operation, context, successMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield operation();
                if (successMessage) {
                    vscode.window.showInformationMessage(successMessage);
                }
                return result;
            }
            catch (error) {
                this.handleError(error, context);
                return undefined;
            }
        });
    }
    static validateCondition(condition, errorMessage) {
        if (!condition) {
            throw new Error(errorMessage);
        }
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=errorHandler.js.map