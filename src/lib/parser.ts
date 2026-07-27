import pdf from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extracts raw text from a document buffer based on its MIME type.
 * Supports PDF, DOCX, and TXT files.
 */
export async function extractTextFromBuffer(buffer: Buffer, mimeType: string): Promise<string> {
  const normalizedMime = mimeType.toLowerCase();

  try {
    if (normalizedMime === 'application/pdf') {
      const parsedData = await pdf(buffer);
      return parsedData.text || '';
    } 
    
    if (
      normalizedMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      normalizedMime === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    } 
    
    if (
      normalizedMime.startsWith('text/') || 
      normalizedMime === 'application/octet-stream' ||
      normalizedMime === 'text/plain'
    ) {
      return buffer.toString('utf-8');
    }

    // Default fallback: check file signature/extension or try reading as text
    return buffer.toString('utf-8');
  } catch (error) {
    console.error(`Error extracting text from file with mime ${mimeType}:`, error);
    throw new Error(`Failed to parse resume document: ${(error as Error).message}`);
  }
}
