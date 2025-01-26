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
exports.ConfigManager = void 0;
const vscode = require("vscode");
class ConfigManager {
    static getConfig() {
        const config = vscode.workspace.getConfiguration(this.SECTION);
        return {
            maxContentSizeMB: config.get('maxContentSizeMB', 10),
            customStylesheet: config.get('customStylesheet', null)
        };
    }
    static updateConfig(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = vscode.workspace.getConfiguration(this.SECTION);
            for (const [key, value] of Object.entries(settings)) {
                yield config.update(key, value, true);
            }
        });
    }
    static validateContentSize(contentSizeInBytes) {
        const maxSizeInBytes = this.getConfig().maxContentSizeMB * 1024 * 1024;
        return contentSizeInBytes <= maxSizeInBytes;
    }
}
exports.ConfigManager = ConfigManager;
ConfigManager.SECTION = 'kleinPDFGenerator';
//# sourceMappingURL=config.js.map