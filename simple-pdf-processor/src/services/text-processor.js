import fs from 'fs';
import path from 'path';
import sheetsUpdater from './sheets-updater.js';

class TextProcessor {
    async process(filePath) {
        try {
            const stats = fs.statSync(filePath);
            const content = await fs.promises.readFile(filePath, 'utf8');

            // Basic text analysis
            const words = content.split(/\s+/).filter(w => w.length > 0);
            const chunks = this.createChunks(content);

            const result = {
                status: 'success',
                raw_content: {
                    text: content,
                    chunks: chunks.map(chunk => ({
                        text: chunk,
                        metadata: {
                            length: chunk.length,
                            word_count: chunk.split(/\s+/).filter(w => w.length > 0).length
                        }
                    }))
                },
                file_info: {
                    path: filePath,
                    size_bytes: stats.size,
                    size_mb: (stats.size / (1024 * 1024)).toFixed(2),
                    created: stats.birthtime,
                    modified: stats.mtime
                },
                statistics: {
                    words: words.length,
                    chunks: chunks.length,
                    estimated_total_tokens: Math.ceil(content.length / 4),
                    average_tokens_per_chunk: Math.ceil((content.length / 4) / chunks.length)
                },
                processing_meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                }
            };

            // Update Google Sheets
            const fileName = path.basename(filePath);
            await sheetsUpdater.updateProcessingRecord(result, fileName);

            return result;
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
                processing_meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                }
            };
        }
    }

    createChunks(text, maxChunkSize = 1000) {
        const chunks = [];
        const paragraphs = text.split(/\n\n+/);
        let currentChunk = '';

        for (const paragraph of paragraphs) {
            if ((currentChunk + paragraph).length > maxChunkSize && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
            }
            currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        }

        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }
}

// Create singleton instance
const textProcessor = new TextProcessor();
export default textProcessor;
