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
exports.StylesheetHelper = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs/promises");
const errorHandler_1 = require("./errorHandler");
const config_1 = require("./config");
class StylesheetHelper {
    constructor() {
        this.templateName = 'style-template.css';
    }
    copyTemplateStylesheet() {
        return __awaiter(this, void 0, void 0, function* () {
            yield errorHandler_1.ErrorHandler.wrapAsync(() => __awaiter(this, void 0, void 0, function* () {
                // Determine target directory
                const targetDir = this.getTargetDirectory();
                // Get save location from user
                const uri = yield this.getSaveLocation(targetDir);
                if (!uri)
                    return;
                // Copy template
                yield this.copyTemplate(uri);
                // Offer to update settings
                yield this.offerSettingsUpdate(uri);
            }), 'Stylesheet Template', 'Stylesheet template copied successfully!');
        });
    }
    getTargetDirectory() {
        var _a, _b;
        return ((_b = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.uri.fsPath) ||
            path.join(process.env.HOME || process.env.USERPROFILE || '', 'Documents');
    }
    getSaveLocation(targetDir) {
        return __awaiter(this, void 0, void 0, function* () {
            return vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file(path.join(targetDir, this.templateName)),
                filters: { 'CSS files': ['css'] },
                title: 'Save Stylesheet Template'
            });
        });
    }
    copyTemplate(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const templateContent = yield fs.readFile(path.join(__dirname, '..', 'resources', this.templateName), 'utf8');
            yield fs.writeFile(uri.fsPath, templateContent, 'utf8');
        });
    }
    offerSettingsUpdate(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateSettings = 'Update Settings';
            const response = yield vscode.window.showInformationMessage('Update extension settings to use this stylesheet?', updateSettings);
            if (response === updateSettings) {
                yield config_1.ConfigManager.updateConfig({
                    customStylesheet: uri.fsPath
                });
                vscode.window.showInformationMessage('Settings updated successfully!');
            }
        });
    }
}
exports.StylesheetHelper = StylesheetHelper;
//# sourceMappingURL=stylesheetHelper.js.map