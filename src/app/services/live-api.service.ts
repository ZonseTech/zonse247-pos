import axios, { AxiosInstance } from 'axios';

const LIVE_API_TIMEOUT = 30000;
const LIVE_API_URL = import.meta.env.VITE_LIVE_API_URL;

/**
 * Shared axios instance for live API calls
 * All services should import and use this instead of creating their own
 */
export const liveApi: AxiosInstance = axios.create({
    baseURL: LIVE_API_URL,
    timeout: LIVE_API_TIMEOUT,
    headers: {
        'X-Client-Type': 'web'
    }
});

/**
 * Get the live API base URL
 */
export function getLiveApiUrl(): string | undefined {
    return LIVE_API_URL;
}

/**
 * Check if live API is configured
 */
export function isLiveApiConfigured(): boolean {
    return !!LIVE_API_URL;
}

/**
 * Get tenant ID from electron setup or session storage
 */
export async function getTenantId(): Promise<string | undefined> {
    try {
        // Try electron API first (desktop app)
        if (typeof window !== 'undefined' && (window as any).electronAPI?.settings) {
            const result = await (window as any).electronAPI.settings.getSetup();
            if (result.success && result.data?.tenantId) {
                return result.data.tenantId;
            }
        }

        // Fall back to session storage
        const user = sessionStorage?.getItem('user');
        if (user) {
            return JSON.parse(user).tenantId;
        }
    } catch (error) {
        console.warn('[LiveAPI] Error getting tenant ID:', error);
    }
    return undefined;
}

/**
 * Get auth token from session storage
 */
export function getAuthToken(): string | undefined {
    try {
        const value = sessionStorage?.getItem('token');
        if (!value) return undefined;

        // Handle both raw and JSON-stringified tokens
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    } catch {
        return undefined;
    }
}

/**
 * Get auth headers for live API calls
 * Includes Authorization Bearer token and X-Tenant-Id header
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
    const token = getAuthToken();
    const tenantId = await getTenantId();

    return {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(tenantId && { 'X-Tenant-Id': tenantId })
    };
}

/**
 * Check if live server is reachable
 */
export async function isLiveServerAvailable(): Promise<boolean> {
    if (!LIVE_API_URL) return false;
    try {
        const response = await liveApi.get('/health', { timeout: 5000 });
        return response.status === 200;
    } catch {
        return false;
    }
}

export default liveApi;
