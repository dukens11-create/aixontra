import sanitizeHtml from 'sanitize-html';

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export function sanitizeContent(content: string): string {
  return sanitizeHtml(content, {
    allowedTags: [], // No HTML tags allowed by default
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  });
}

/**
 * Sanitizes HTML content but allows basic formatting
 */
export function sanitizeRichContent(content: string): string {
  return sanitizeHtml(content, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    allowedAttributes: {
      'a': ['href', 'target'],
    },
    allowedSchemes: ['http', 'https'],
    disallowedTagsMode: 'discard',
  });
}

/**
 * Sanitizes a username - allows only alphanumeric, underscore, and hyphen
 */
export function sanitizeUsername(username: string): string {
  return username.replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Sanitizes a search query
 */
export function sanitizeSearchQuery(query: string): string {
  // Remove potential SQL injection characters and trim
  return query
    .replace(/[;'"\\]/g, '')
    .trim()
    .slice(0, 100); // Limit length
}

/**
 * Sanitizes file names
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.') // Remove multiple dots
    .slice(0, 255); // Limit length
}
