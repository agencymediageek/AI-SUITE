/**
 * Get API headers including the WP Site API key from localStorage
 */
export function getWpApiHeaders(): Record<string, string> {
  const apiKey = localStorage.getItem('wpts_api_key');
  if (!apiKey) {
    return {};
  }
  return {
    'X-WP-Site-Key': apiKey,
  };
}

/**
 * Save API key to localStorage
 */
export function saveApiKey(apiKey: string): void {
  localStorage.setItem('wpts_api_key', apiKey);
}

/**
 * Get API key from localStorage
 */
export function getApiKey(): string | null {
  return localStorage.getItem('wpts_api_key');
}

/**
 * Clear API key from localStorage
 */
export function clearApiKey(): void {
  localStorage.removeItem('wpts_api_key');
}
