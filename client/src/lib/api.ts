const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim().replace(/\/$/, '');
export const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

/**
 * Custom fetch wrapper that prefixes requests with API_BASE_URL and
 * automatically attaches credentials (cookies) for authenticated endpoints.
 */
export function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('admin_token');
  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Ensure sameSite credentials (cookies) are sent
  const mergedOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include' as const,
  };

  // Construct absolute URL
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  return fetch(url, mergedOptions);
}

/**
 * Sanitizes file media URLs (PDFs, images, videos) to ensure valid
 * hosted backend storage URLs in both development and production.
 */
export function getMediaUrl(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  const backendBase = API_BASE_URL.replace(/\/api\/?$/, '');

  if (trimmed.startsWith('/uploads/')) {
    return `${backendBase}${trimmed}`;
  }

  if (trimmed.includes('localhost:5000')) {
    return trimmed.replace(/^https?:\/\/localhost:5000/i, backendBase);
  }

  return trimmed;
}


