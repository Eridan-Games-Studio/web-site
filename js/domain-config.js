// ===== DOMAIN CONFIGURATION WITH FALLBACK =====
class DomainConfig {
    constructor() {
        this.primaryDomain = 'https://eridangames.com';
        this.fallbackDomain = 'https://https://eridangames.com';
        this.cache = new Map();
    }

    // Get the appropriate domain for a given path
    async getDomainForPath(path) {
        const cacheKey = `domain_${path}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Try primary domain first
        const primaryUrl = `${this.primaryDomain}${path}`;
        try {
            const response = await fetch(primaryUrl, { method: 'HEAD' });
            if (response.ok) {
                this.cache.set(cacheKey, this.primaryDomain);
                return this.primaryDomain;
            }
        } catch (error) {
            console.log(`Primary domain failed for ${path}, trying fallback:`, error.message);
        }

        // Fallback to secondary domain
        this.cache.set(cacheKey, this.fallbackDomain);
        return this.fallbackDomain;
    }

    // Get full URL with fallback logic
    async getUrl(path) {
        const domain = await this.getDomainForPath(path);
        return `${domain}${path}`;
    }

    // Get wiki URL with fallback logic
    async getWikiUrl(subPath = '') {
        const wikiPath = `/eridan-wiki/${subPath}`;
        return await this.getUrl(wikiPath);
    }

    // Get content URL with fallback logic
    async getContentUrl(path) {
        // Try primary domain first (Eridan Games - no web-site prefix)
        const primaryUrl = `${this.primaryDomain}/content/${path}`;
        try {
            const response = await fetch(primaryUrl, { method: 'HEAD' });
            if (response.ok) {
                this.cache.set(`content_${path}`, this.primaryDomain);
                return primaryUrl;
            }
        } catch (error) {
            console.log(`Primary domain failed for content/${path}, trying fallback:`, error.message);
        }

        // Fallback to GitHub domain (with web-site prefix)
        const fallbackUrl = `${this.fallbackDomain}/web-site/content/${path}`;
        this.cache.set(`content_${path}`, this.fallbackDomain);
        return fallbackUrl;
    }

    // Synchronous method for immediate use (uses primary domain)
    getPrimaryUrl(path) {
        return `${this.primaryDomain}${path}`;
    }

    // Synchronous method for fallback domain
    getFallbackUrl(path) {
        return `${this.fallbackDomain}${path}`;
    }
}

// Create global instance
window.domainConfig = new DomainConfig();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DomainConfig;
}
