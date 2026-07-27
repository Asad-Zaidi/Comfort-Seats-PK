/**
 * HTML Sanitizer Utility for Product Rich Text Descriptions.
 * Allows safe HTML formatting tags and attributes while stripping dangerous XSS scripts/iframes.
 */

const ALLOWED_TAGS = new Set([
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'br', 'hr',
    'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup',
    'a', 'img', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td'
]);

const ALLOWED_ATTRS = new Set([
    'style', 'class', 'href', 'src', 'alt', 'title', 'target', 'rel',
    'width', 'height', 'align', 'colspan', 'rowspan', 'border', 'cellpadding', 'cellspacing'
]);

export function sanitizeHtml(html) {
    if (!html || typeof html !== 'string') return '';

    // If it doesn't contain HTML tags, return as is
    if (!/<[a-z][\s\S]*>/i.test(html)) {
        return html;
    }

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        function cleanNode(node) {
            const children = Array.from(node.childNodes);
            for (const child of children) {
                if (child.nodeType === Node.ELEMENT_NODE) {
                    const tagName = child.tagName.toLowerCase();

                    if (!ALLOWED_TAGS.has(tagName)) {
                        // Replace disallowed tag with its text contents or remove
                        if (['script', 'iframe', 'object', 'embed', 'form', 'style', 'input', 'button'].includes(tagName)) {
                            child.remove();
                        } else {
                            const textNode = doc.createTextNode(child.textContent || '');
                            child.replaceWith(textNode);
                        }
                    } else {
                        // Clean attributes
                        const attrs = Array.from(child.attributes);
                        for (const attr of attrs) {
                            const attrName = attr.name.toLowerCase();
                            // Remove inline event handlers (on*) and unallowed attributes
                            if (attrName.startsWith('on') || !ALLOWED_ATTRS.has(attrName)) {
                                child.removeAttribute(attr.name);
                            } else if ((attrName === 'href' || attrName === 'src') && /^\s*javascript:/i.test(attr.value)) {
                                child.removeAttribute(attr.name);
                            }
                        }

                        // Ensure external links have rel="noopener noreferrer"
                        if (tagName === 'a' && child.getAttribute('target') === '_blank') {
                            child.setAttribute('rel', 'noopener noreferrer');
                        }

                        cleanNode(child);
                    }
                }
            }
        }

        cleanNode(doc.body);
        return doc.body.innerHTML;
    } catch (e) {
        console.error('HTML Sanitization error:', e);
        return html;
    }
}

/**
 * Checks whether a string contains HTML structure or is plain text.
 */
export function isHtmlContent(str) {
    if (!str || typeof str !== 'string') return false;
    const trimmed = str.trim();
    return /<[a-z][\s\S]*>/i.test(trimmed);
}

/**
 * Strips all HTML tags and returns clean plain text.
 * Useful for product card summaries, meta tags, previews, and order modal.
 */
export function stripHtml(str) {
    if (!str || typeof str !== 'string') return '';
    if (!/<[a-z][\s\S]*>/i.test(str)) {
        return str.trim();
    }
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(str, 'text/html');
        return (doc.body.textContent || doc.body.innerText || '').replace(/\s+/g, ' ').trim();
    } catch (e) {
        return str.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }
}

