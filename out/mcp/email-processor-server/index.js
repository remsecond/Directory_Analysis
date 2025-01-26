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
const mailparser_1 = require("mailparser");
const pdf_js_extract_1 = require("pdf.js-extract");
const events_1 = require("events");
class EmailProcessor extends events_1.EventEmitter {
    constructor() {
        super();
        this.pdfExtractor = new pdf_js_extract_1.PDFExtract();
    }
    async extractTextFromPDF(pdfContent) {
        try {
            const data = await this.pdfExtractor.extractBuffer(pdfContent);
            return data.pages.map(page => page.content.map(item => item.str).join(' ')).join('\n');
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to extract text from PDF: ${error.message}`);
            }
            throw error;
        }
    }
    extractEmailHeaders(text) {
        const headers = {};
        const lines = text.split('\n');
        let currentHeader = '';
        for (const line of lines) {
            const match = line.match(/^(From|To|Subject|Date|Cc)\s*:\s*(.+)/i);
            if (match) {
                currentHeader = match[1].toLowerCase();
                headers[currentHeader] = match[2].trim();
            }
            else if (currentHeader && line.trim() && line.startsWith(' ')) {
                // Handle header value continuation
                headers[currentHeader] += ' ' + line.trim();
            }
        }
        return headers;
    }
    formatAddressObject(addr) {
        if (Array.isArray(addr)) {
            return addr.map(a => a.text).join(', ');
        }
        return addr.text || '';
    }
    formatContentType(contentType) {
        if (!contentType)
            return 'text/plain';
        let result = contentType.value;
        if (contentType.params) {
            const params = Object.entries(contentType.params)
                .map(([key, value]) => `${key}=${value}`)
                .join('; ');
            if (params) {
                result += `; ${params}`;
            }
        }
        return result;
    }
    async convertToMIME(content, format) {
        const headers = this.extractEmailHeaders(content);
        const mimeTemplate = `From: ${headers.from || '<extracted-from-content>'}
To: ${headers.to || '<extracted-from-content>'}
Subject: ${headers.subject || '<extracted-from-content>'}
Date: ${headers.date || new Date().toString()}
Content-Type: text/plain; charset=UTF-8

${content}`;
        return mimeTemplate;
    }
    async parseEmail(content, format, options = {}) {
        try {
            // Convert content to MIME format if needed
            const mimeContent = format === 'pdf' || format === 'text'
                ? await this.convertToMIME(content, format)
                : content;
            const parsedEmail = await (0, mailparser_1.simpleParser)(mimeContent);
            // Create headers object from Map with proper formatting
            const headers = {};
            parsedEmail.headers.forEach((value, key) => {
                if (key === 'from' && parsedEmail.from) {
                    headers[key] = this.formatAddressObject(parsedEmail.from);
                }
                else if (key === 'to' && parsedEmail.to) {
                    headers[key] = this.formatAddressObject(parsedEmail.to);
                }
                else if (key === 'content-type') {
                    headers[key] = this.formatContentType(value);
                }
                else {
                    headers[key] = value.toString();
                }
            });
            // Extract recipients
            const recipients = [];
            if (parsedEmail.to) {
                const toAddresses = Array.isArray(parsedEmail.to) ? parsedEmail.to : [parsedEmail.to];
                recipients.push(...toAddresses.map(addr => addr.text || ''));
            }
            const emailBody = parsedEmail.text || '';
            const result = {
                headers,
                body: emailBody,
                ...(options.includeMetadata && {
                    metadata: {
                        sender: parsedEmail.from?.text || '',
                        recipients,
                        date: parsedEmail.date?.toISOString() || '',
                        subject: parsedEmail.subject || '',
                    },
                }),
                ...(options.extractAttachments && {
                    attachments: (parsedEmail.attachments || []).map((att) => ({
                        filename: att.filename || 'unnamed',
                        content: att.content,
                        contentType: att.contentType,
                    })),
                }),
            };
            return result;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to parse email: ${error.message}`);
            }
            throw error;
        }
    }
    async processEmailFile(filePath, format, options = {}) {
        try {
            const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
            const content = await fs.readFile(filePath);
            let textContent;
            if (format === 'pdf') {
                textContent = await this.extractTextFromPDF(content);
            }
            else {
                textContent = content.toString('utf-8');
            }
            return this.parseEmail(textContent, format, options);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to process email file: ${error.message}`);
            }
            throw error;
        }
    }
}
exports.default = EmailProcessor;
//# sourceMappingURL=index.js.map