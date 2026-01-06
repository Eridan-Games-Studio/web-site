/**
 * Security utilities for sanitizing and validating user input
 */

class SecurityUtils {
    /**
     * Sanitize HTML content to prevent XSS attacks
     * Strips all HTML tags and returns plain text
     */
    static sanitizeHTML(input) {
        if (!input) return '';

        // Create a temporary div to decode HTML entities
        const temp = document.createElement('div');
        temp.textContent = input;
        return temp.innerHTML;
    }

    /**
     * Sanitize text while preserving line breaks
     * Converts \n to <br> tags safely
     */
    static sanitizeTextWithBreaks(input) {
        if (!input) return '';

        // First escape all HTML
        const escaped = this.sanitizeHTML(input);

        // Then safely convert newlines to <br> tags
        return escaped.replace(/\n/g, '<br>');
    }

    /**
     * Allow only specific safe HTML tags
     * Used for rich content like descriptions
     */
    static sanitizeRichText(input, allowedTags = ['b', 'i', 'em', 'strong', 'br', 'p']) {
        if (!input) return '';

        // Create a temporary div
        const temp = document.createElement('div');
        temp.innerHTML = input;

        // Remove all script tags and event handlers
        this.removeUnsafeElements(temp);

        // Filter to only allowed tags
        this.filterAllowedTags(temp, allowedTags);

        return temp.innerHTML;
    }

    /**
     * Remove script tags and elements with event handlers
     */
    static removeUnsafeElements(element) {
        // Remove all script tags
        const scripts = element.querySelectorAll('script');
        scripts.forEach(script => script.remove());

        // Remove all elements with event handlers
        const allElements = element.querySelectorAll('*');
        allElements.forEach(el => {
            // Remove all event handler attributes
            const attributes = Array.from(el.attributes);
            attributes.forEach(attr => {
                if (attr.name.startsWith('on')) {
                    el.removeAttribute(attr.name);
                }
            });

            // Remove javascript: URLs
            if (el.hasAttribute('href') && el.getAttribute('href').toLowerCase().startsWith('javascript:')) {
                el.removeAttribute('href');
            }
            if (el.hasAttribute('src') && el.getAttribute('src').toLowerCase().startsWith('javascript:')) {
                el.removeAttribute('src');
            }
        });
    }

    /**
     * Filter elements to only allowed tags
     */
    static filterAllowedTags(element, allowedTags) {
        const allElements = element.querySelectorAll('*');
        allElements.forEach(el => {
            if (!allowedTags.includes(el.tagName.toLowerCase())) {
                // Replace disallowed tags with their text content
                const textNode = document.createTextNode(el.textContent);
                el.parentNode.replaceChild(textNode, el);
            }
        });
    }

    /**
     * Validate URL parameter to prevent injection
     */
    static validateUrlParameter(param) {
        if (!param || typeof param !== 'string') {
            return null;
        }

        // Allow only alphanumeric characters, hyphens, and underscores
        const validPattern = /^[a-zA-Z0-9_-]+$/;

        if (!validPattern.test(param)) {
            return null;
        }

        // Limit length to prevent DoS
        if (param.length > 100) {
            return null;
        }

        return param;
    }

    /**
     * Validate and sanitize URL
     */
    static validateUrl(url) {
        if (!url || typeof url !== 'string') {
            return null;
        }

        try {
            const parsed = new URL(url);

            // Only allow http and https protocols
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                return null;
            }

            return url;
        } catch (e) {
            return null;
        }
    }
}

// Export for use in other scripts
window.SecurityUtils = SecurityUtils;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityUtils;
}
