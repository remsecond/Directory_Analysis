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
exports.WkhtmltopdfValidator = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const vscode = __importStar(require("vscode"));
const os = __importStar(require("os"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class WkhtmltopdfValidator {
    constructor() {
        this.wkhtmltopdfPath = this.getWkhtmltopdfPath();
    }
    getWkhtmltopdfPath() {
        switch (os.platform()) {
            case 'win32':
                return '"C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe"';
            case 'darwin':
                return '/usr/local/bin/wkhtmltopdf';
            default:
                return 'wkhtmltopdf';
        }
    }
    async validateInstallation() {
        try {
            const { stdout } = await execAsync(`${this.wkhtmltopdfPath} --version`);
            return stdout.toLowerCase().includes('wkhtmltopdf');
        }
        catch (error) {
            return false;
        }
    }
    async checkAndNotify() {
        const isInstalled = await this.validateInstallation();
        if (!isInstalled) {
            const installButton = 'Download wkhtmltopdf';
            const response = await vscode.window.showErrorMessage('wkhtmltopdf is not installed or not found in PATH. Please install it to generate PDFs.', installButton);
            if (response === installButton) {
                vscode.env.openExternal(vscode.Uri.parse('https://wkhtmltopdf.org/downloads.html'));
            }
            return false;
        }
        return true;
    }
}
exports.WkhtmltopdfValidator = WkhtmltopdfValidator;
//# sourceMappingURL=validator.js.map