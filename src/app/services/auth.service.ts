import api from './http.service';
import { liveApi, getTenantId, getLiveApiUrl, isLiveApiConfigured, isLiveServerAvailable as checkLiveServerAvailable } from './live-api.service';
import { isElectron } from '../../helpers/index.helper';

interface OfflineFirstLoginResult {
    success: boolean;
    source: 'offline' | 'live';
    data?: LoginResponse;
    error?: string;
}

interface RoleResponse {
    data: {
        role: {
            roleId: string;
            name: string;
            displayName?: string;
            description?: string;
            tenantId?: string;
        };
    };
}

interface PrivilegesResponse {
    data: {
        permissions: string[];
        total: number;
    };
}

export type LoginProgressCallback = (message: string, step: number, totalSteps: number) => void;

class AuthService {
    async login(credentials: AuthProps, onProgress?: LoginProgressCallback, isDesktop?: boolean): Promise<LoginResponse> {
        const totalSteps = 6;
        const updateProgress = (message: string, step: number) => {
            onProgress?.(message, step, totalSteps);
        };

        if (!isDesktop) {
            updateProgress('Connecting to server...', 1);
            const liveResult = await this.tryLiveLogin(credentials);

            if (liveResult.success && liveResult.data) {
                updateProgress('Login successful!', totalSteps);
                return liveResult.data;
            }

            throw new Error(liveResult.error || 'Authentication failed');
        }

        updateProgress('Checking local database...', 1);
        const offlineResult = await this.tryOfflineLogin(credentials);

        if (offlineResult.success && offlineResult.data) {
            updateProgress('Login successful!', totalSteps);
            return offlineResult.data;
        }

        updateProgress('Connecting to live server...', 2);
        const liveResult = await this.tryLiveLogin(credentials);

        if (liveResult.success && liveResult.data) {
            await this.syncDataToOffline(liveResult.data, credentials, updateProgress);

            updateProgress('Login successful!', totalSteps);
            return liveResult.data;
        }

        const errorMessage = liveResult.error || offlineResult.error || 'Authentication failed';
        throw new Error(errorMessage);
    }

    /**
     * Try offline/local database login
     */
    private async tryOfflineLogin(credentials: AuthProps): Promise<OfflineFirstLoginResult> {
        try {
            const result = await api.post<ApiResponse<LoginResponse>>('auth/login', credentials as any)
                .then((res) => res.data);

            if (result?.data?.token) {
                return { success: true, source: 'offline', data: result.data };
            }

            return { success: false, source: 'offline', error: result.message || 'Invalid credentials' };
        } catch (error: any) {
            return {
                success: false,
                source: 'offline',
                error: error?.error?.response?.data?.message ||
                    error?.response?.data?.message ||
                    error?.message ||
                    'Offline authentication failed'
            };
        }
    }

    /**
     * Try live/remote server login
     */
    private async tryLiveLogin(credentials: AuthProps): Promise<OfflineFirstLoginResult> {
        const useLiveApi = isLiveApiConfigured();
        const isDesktopPlatform = isElectron();

        if (!useLiveApi && isDesktopPlatform) {
            return { success: false, source: 'live', error: 'Live server URL not configured' };
        }

        try {
            let result: ApiResponse<LoginResponse>;

            if (useLiveApi) {
                const tenantId = await getTenantId();

                const response = await liveApi.post<ApiResponse<LoginResponse>>('auth/login', {
                    ...credentials,
                    offlineMode: true
                }, {
                    headers: {
                        ...(tenantId && { 'X-Tenant-Id': tenantId })
                    }
                });

                result = response.data;
            } else {
                const response = await api.post<ApiResponse<LoginResponse>>('auth/login', credentials as any);
                result = response.data;
            }

            if (result?.data?.token) {
                return { success: true, source: 'live', data: result.data };
            }

            return { success: false, source: 'live', error: result.message || 'Invalid credentials' };
        } catch (error: any) {
            const axiosError = error?.error || error;
            const errorCode = axiosError?.code || error?.code;

            if (errorCode === 'ECONNREFUSED' || errorCode === 'ERR_NETWORK') {
                return { success: false, source: 'live', error: 'Cannot connect to server. Check your internet connection.' };
            }

            const errorMessage = axiosError?.response?.data?.message
                || error?.response?.data?.message
                || axiosError?.response?.data?.error
                || error?.response?.data?.error
                || axiosError?.message
                || error?.message
                || 'Authentication failed';

            return {
                success: false,
                source: 'live',
                error: errorMessage
            };
        }
    }

    /**
     * Sync data to offline database after live login
     * Order: role → permissions → user (to avoid FK errors)
     */
    private async syncDataToOffline(
        loginData: LoginResponse,
        credentials: AuthProps,
        updateProgress: (message: string, step: number) => void
    ): Promise<void> {
        const { user, token } = loginData;
        const roleId = user.roleId;

        try {
            if (roleId) {
                updateProgress('Verifying user role...', 3);
                const role = await this.fetchRoleFromLive(roleId, token);
                if (role) {
                    updateProgress('Saving role offline...', 3);
                    await this.saveRoleOffline(role);
                }

                updateProgress('Fetching user permissions...', 4);
                const permissions = await this.fetchPermissionsFromLive(roleId, token);
                if (permissions.length > 0) {
                    updateProgress(`Saving ${permissions.length} permissions offline...`, 4);
                    await this.savePermissionsOffline(permissions, roleId);
                }
            }

            updateProgress('Saving user data offline...', 5);
            await this.saveUserOffline(loginData, credentials);
        } catch (error) {
            // Ignore
        }
    }

    /**
     * Fetch role from live server (requires auth token)
     */
    private async fetchRoleFromLive(roleId: string, token: string): Promise<RoleResponse['data']['role'] | null> {
        try {
            const tenantId = await getTenantId();
            const response = await liveApi.get<RoleResponse>('auth/verifying-roles', {
                params: { roleId },
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...(tenantId && { 'X-Tenant-Id': tenantId })
                }
            });
            return response.data?.data?.role || null;
        } catch (error: any) {
            console.warn('[AuthService] Failed to fetch role:', error?.response?.data?.message || error?.message);
            return null;
        }
    }

    /**
     * Save role to offline DB
     */
    private async saveRoleOffline(role: RoleResponse['data']['role']): Promise<void> {
        await api.post('auth/offline/save-role', {
            roleId: role.roleId,
            name: role.name,
            displayName: role.displayName,
            description: role.description,
            tenantId: role.tenantId
        });
    }

    /**
     * Fetch permissions from live server (requires auth token)
     * Optimized for 100+ permissions
     */
    private async fetchPermissionsFromLive(roleId: string, token: string): Promise<string[]> {
        try {
            const tenantId = await getTenantId();
            const response = await liveApi.get<PrivilegesResponse>('auth/verifying-privileges', {
                params: { roleId },
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...(tenantId && { 'X-Tenant-Id': tenantId })
                }
            });
            return response.data?.data?.permissions || [];
        } catch (error: any) {
            console.warn('[AuthService] Failed to fetch permissions:', error?.response?.data?.message || error?.message);
            return [];
        }
    }

    /**
     * Save permissions to offline DB (handles 100+ efficiently)
     */
    private async savePermissionsOffline(permissions: string[], roleId: string): Promise<void> {
        await api.post('auth/offline/save-permissions', {
            permissions,
            roleId
        });
    }

    /**
     * Save user to offline DB (uses correct endpoint: auth/offline/save-user)
     * Includes full user data with branch, tenant, and subscription
     */
    private async saveUserOffline(loginData: LoginResponse, credentials: AuthProps): Promise<void> {
        const { user } = loginData;
        const userData = user as any;

        await api.post('auth/offline/save-user', {
            username: credentials.username,
            password: credentials.password,

            userId: userData.userId,
            fullname: userData.fullname,
            email: userData.email,
            phone: userData.phone,
            tenantId: userData.tenantId,
            branchId: userData.branchId,
            roleId: userData.roleId,
            status: userData.status,
            accessibleBranches: userData.accessibleBranches,
            allowedTerminals: userData.allowedTerminals,
            maxDiscountPercent: userData.maxDiscountPercent,
            canOverridePrices: userData.canOverridePrices,
            pinCode: userData.pinCode,
            currentBranchId: userData.currentBranchId,

            branch: userData.branch ? {
                branchId: userData.branch.branchId,
                tenantId: userData.branch.tenantId,
                branchName: userData.branch.branchName,
                branchCode: userData.branch.branchCode,
                siteId: userData.branch.siteId,
                siteName: userData.branch.siteName,
                description: userData.branch.description,
                addressLine1: userData.branch.addressLine1,
                addressLine2: userData.branch.addressLine2,
                addressLine3: userData.branch.addressLine3,
                districtId: userData.branch.districtId,
                location: userData.branch.location,
                businessType: userData.branch.businessType,
                city: userData.branch.city,
                phoneNumber: userData.branch.phoneNumber,
                phone: userData.branch.phone,
                email: userData.branch.email,
                currencyCode: userData.branch.currencyCode,
                currencySymbol: userData.branch.currencySymbol,
                taxRate: userData.branch.taxRate,
                chargeTax: userData.branch.chargeTax,
                receiptFooter: userData.branch.receiptFooter,
                logoUrl: userData.branch.logoUrl,
                branchSubscriptionId: userData.branch.branchSubscriptionId,
                status: userData.branch.status,
                branchSubscription: userData.branch.branchSubscription ? {
                    branchSubscriptionId: userData.branch.branchSubscription.branchSubscriptionId,
                    subscriptionPlanId: userData.branch.branchSubscription.subscriptionPlanId,
                    status: userData.branch.branchSubscription.status,
                    startsAt: userData.branch.branchSubscription.startsAt,
                    endsAt: userData.branch.branchSubscription.endsAt,
                    autoRenew: userData.branch.branchSubscription.autoRenew,
                    paymentMethod: userData.branch.branchSubscription.paymentMethod,
                    lastPaymentDate: userData.branch.branchSubscription.lastPaymentDate,
                    nextPaymentDate: userData.branch.branchSubscription.nextPaymentDate,
                } : undefined,
            } : undefined,
        });
    }

    /**
     * Check if live server is reachable
     */
    async isLiveServerAvailable(): Promise<boolean> {
        return checkLiveServerAvailable();
    }

    /**
     * Logout user
     */
    async logout(userId: string): Promise<void> {
        try {
            await api.get(`auth/logout/${userId}`);
        } catch (error) {
            console.warn('[AuthService] Logout error:', error);
        }
    }

    /**
     * Refresh JWT token using the current token
     * Calls LIVE API: POST /auth/refresh-token
     * The API validates the token (ignoring expiration) and issues a new one if user is active
     * @param currentToken - The current JWT token (can be expired)
     * @returns New JWT token string
     * @throws Error when token refresh fails or user is not found/inactive
     */
    async refreshToken(currentToken: string): Promise<string> {
        const useLiveApi = isLiveApiConfigured();
        const isDesktopPlatform = isElectron();

        // Only require live API on desktop platform
        if (!useLiveApi && isDesktopPlatform) {
            throw new Error('Live server URL not configured');
        }

        try {
            let result: ApiResponse<RefreshTokenResponse>;

            if (useLiveApi) {
                const tenantId = await getTenantId();

                const response = await liveApi.post<ApiResponse<RefreshTokenResponse>>(
                    'auth/refresh-token',
                    { token: currentToken },
                    {
                        headers: {
                            ...(tenantId && { 'X-Tenant-Id': tenantId })
                        }
                    }
                );
                result = response.data;
            } else {
                // Use regular API for web/mobile
                const response = await api.post<ApiResponse<RefreshTokenResponse>>(
                    'auth/refresh-token',
                    { token: currentToken } as any
                );
                result = response.data;
            }

            if (result?.data?.token) {
                return result.data.token;
            }

            throw new Error(result?.message || 'Token refresh failed');
        } catch (error: any) {
            console.error('[AuthService] Token refresh error:', error?.response?.data || error?.message);
            throw new Error(error?.response?.data?.message || error?.message || 'Token refresh failed');
        }
    }

    /**
     * Verify if a JWT token is valid
     * Calls LIVE API: POST /auth/verify-token
     * @param token - The JWT token to verify
     * @returns User data if token is valid
     */
    async verifyToken(token: string): Promise<any> {
        const useLiveApi = isLiveApiConfigured();
        const isDesktopPlatform = isElectron();

        // Only require live API on desktop platform
        if (!useLiveApi && isDesktopPlatform) {
            throw new Error('Live server URL not configured');
        }

        try {
            if (useLiveApi) {
                const tenantId = await getTenantId();

                const response = await liveApi.post<ApiResponse<{ user: any }>>(
                    'auth/verify-token',
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            ...(tenantId && { 'X-Tenant-Id': tenantId })
                        }
                    }
                );

                return response.data?.data?.user;
            } else {
                // Use regular API for web/mobile
                const response = await api.post<ApiResponse<{ user: any }>>(
                    'auth/verify-token',
                    {} as any,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    } as any
                );

                return response.data?.data?.user;
            }
        } catch (error: any) {
            throw new Error(error?.response?.data?.message || 'Token verification failed');
        }
    }
}

const authService = new AuthService();
export default authService;
