/**
 * Session Service - In-memory session management for Electron main process
 * 
 * Stores authentication token in memory (not persisted to disk)
 * Used by sync job for API authentication
 */

interface SessionData {
    token: string | null;
    userId: string | null;
    tenantId: string | null;
    branchId: string | null;
}

class SessionService {
    private session: SessionData = {
        token: null,
        userId: null,
        tenantId: null,
        branchId: null,
    };

    private listeners: Set<(session: SessionData) => void> = new Set();

    /**
     * Set the authentication token
     */
    setToken(token: string | null): void {
        this.session.token = token;
        this.notifyListeners();
    }

    /**
     * Get the current token
     */
    getToken(): string | null {
        return this.session.token;
    }

    /**
     * Set session data (token + user info)
     */
    setSession(data: Partial<SessionData>): void {
        this.session = { ...this.session, ...data };
        this.notifyListeners();
    }

    /**
     * Get full session data
     */
    getSession(): SessionData {
        return { ...this.session };
    }

    /**
     * Clear the session (on logout)
     */
    clearSession(): void {
        this.session = {
            token: null,
            userId: null,
            tenantId: null,
            branchId: null,
        };
        this.notifyListeners();
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.session.token;
    }

    /**
     * Subscribe to session changes
     */
    onSessionChange(listener: (session: SessionData) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        const sessionData = this.getSession();
        this.listeners.forEach(listener => listener(sessionData));
    }
}

// Singleton instance
export const sessionService = new SessionService();
export default sessionService;
