import { exec } from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';
import * as os from 'os';

const execAsync = promisify(exec);

export class WkhtmltopdfValidator {
    private readonly wkhtmltopdfPath: string;

    constructor() {
        this.wkhtmltopdfPath = this.getWkhtmltopdfPath();
    }

    private getWkhtmltopdfPath(): string {
        switch (os.platform()) {
            case 'win32':
                return '"C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe"';
            case 'darwin':
                return '/usr/local/bin/wkhtmltopdf';
            default:
                return 'wkhtmltopdf';
        }
    }

    async validateInstallation(): Promise<boolean> {
        try {
            const { stdout } = await execAsync(`${this.wkhtmltopdfPath} --version`);
            return stdout.toLowerCase().includes('wkhtmltopdf');
        } catch (error) {
            return false;
        }
    }

    async checkAndNotify(): Promise<boolean> {
        const isInstalled = await this.validateInstallation();
        
        if (!isInstalled) {
            const installButton = 'Download wkhtmltopdf';
            const response = await vscode.window.showErrorMessage(
                'wkhtmltopdf is not installed or not found in PATH. Please install it to generate PDFs.',
                installButton
            );

            if (response === installButton) {
                vscode.env.openExternal(vscode.Uri.parse('https://wkhtmltopdf.org/downloads.html'));
            }
            return false;
        }
        return true;
    }
}
