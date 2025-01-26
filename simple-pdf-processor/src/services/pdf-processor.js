import fs from 'fs';
import path from 'path';

class PDFProcessor {
    async process(filePath) {
        const stats = fs.statSync(filePath);
        const content = await fs.promises.readFile(filePath, 'utf8');
        
        // Basic text analysis
        const words = content.split(/\s+/).filter(w => w.length > 0);
        const format = content.match(/^Message \d+ of \d+/m) ? 'ofw' : 'email';
        const chunks = this.createChunks(content, format);
        
        // Calculate statistics
        const totalTokens = this.estimateTokens(content);
        const avgTokens = chunks.reduce((sum, chunk) => sum + chunk.metadata.estimated_tokens, 0) / chunks.length;
        
        return {
            raw_content: {
                text: content,
                chunks: chunks,
                structure: {
                    format: format
                }
            },
            file_info: {
                path: filePath,
                size_bytes: stats.size,
                size_mb: (stats.size / (1024 * 1024)).toFixed(2),
                created: stats.birthtime,
                modified: stats.mtime
            },
            statistics: {
                pages: 1, // Simple text files treated as single page
                words: words.length,
                chunks: chunks.length,
                estimated_total_tokens: totalTokens,
                average_tokens_per_chunk: Math.round(avgTokens)
            },
            processing_meta: {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                processing_time: 0 // Will be set by timing wrapper
            }
        };
    }

    estimateTokens(text) {
        // Rough token estimation - can be refined based on actual tokenizer
        return Math.ceil(text.length / 3.2);
    }

    findMessageBoundary(text, format) {
        // Check for common message headers based on format
        if (format === 'ofw') {
            const match = text.match(/^Message \d+ of \d+/m);
            return match ? match.index : -1;
        } else {
            // Email format
            const match = text.match(/^(Subject|From|To|Date):/m);
            return match ? match.index : -1;
        }
    }

    createChunks(text, format, maxTokens = 25000, targetTokens = 150) {
        const chunks = [];
        const minOverlap = 50; // Minimum token overlap between chunks
        
        let position = 0;
        
        while (position < text.length) {
            // Calculate remaining text
            const remainingText = text.slice(position);
            
            // Find next message boundary
            const nextBoundary = this.findMessageBoundary(remainingText.slice(1), format);
            
            // Calculate chunk size based on token limits and message boundaries
            let chunkSize = Math.min(
                targetTokens * 3.2, // Convert target tokens to characters
                maxTokens * 3.2
            );
            
            // Adjust chunk size if we found a message boundary
            if (nextBoundary > 0 && nextBoundary < chunkSize) {
                chunkSize = nextBoundary;
            }
            
            // Extract chunk
            let chunk = remainingText.slice(0, chunkSize);
            
            // Ensure we don't cut in the middle of a line
            const lastNewline = chunk.lastIndexOf('\n');
            if (lastNewline > 0 && lastNewline > chunkSize * 0.8) {
                chunk = chunk.slice(0, lastNewline);
            }
            
            // Add overlap from previous chunk if this isn't the first chunk
            if (chunks.length > 0) {
                const prevChunk = chunks[chunks.length - 1];
                const overlapText = prevChunk.text.slice(-minOverlap * 3.2);
                chunk = overlapText + chunk;
            }
            
            // Add chunk with metadata
            chunks.push({
                text: chunk,
                metadata: {
                    length: chunk.length,
                    word_count: chunk.split(/\s+/).filter(w => w.length > 0).length,
                    estimated_tokens: this.estimateTokens(chunk),
                    overlap_tokens: chunks.length > 0 ? minOverlap : 0,
                    continues_from: chunks.length > 0 ? chunks.length - 1 : undefined
                }
            });
            
            // Move position forward, accounting for overlap
            position += chunk.length - (chunks.length > 1 ? minOverlap * 3.2 : 0);
        }
        
        return chunks;
    }
}

// Create singleton instance
const pdfProcessor = new PDFProcessor();

export default pdfProcessor;
