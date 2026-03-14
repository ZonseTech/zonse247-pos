import api from '../services/http.service';
import authService from '../services/auth.service';
import { Confirm, Notify, Loading } from 'notiflix';
import React, { type PropsWithChildren, createContext, useContext, useEffect, useState, useCallback } from 'react'
import { isElectron } from '../utils';
import { useIsElectron } from '../hooks/useMediaQuery';
import settingsService from '../services/settings.service';

type ContextProps = {
    user: User | null;
    auth: any;
    isAuthenticated: boolean;
    isLoading: boolean;
    signin: (cb: AuthProps) => Promise<LoginResponse>;
    signup: (cb: AccountActivationProps) => Promise<AccountActivationResponse>;
    signout: (callback: () => void) => void;
    updateUser: (userData: User) => void;
    activeBranchId: string | null;
}

const authContext = createContext<ContextProps>({
    user: null,
    auth: null,
    isAuthenticated: false,
    isLoading: false,
    signin: async () => ({} as Promise<LoginResponse>),
    signup: async () => ({} as Promise<AccountActivationResponse>),
    signout: async () => ({
        // 
    } as any),
    updateUser: () => { },
    activeBranchId: null,
});

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [auth, setAuth] = useState<string | unknown>(null);
    const [user, setUser] = useState<User | null>(null);
    const isAuthenticated = !!(user && auth);
    const isDesktop = useIsElectron();

    const activeBranchId = user?.currentBranchId || user?.branchId || null;

    useEffect(() => {
        const loadUserToken = async () => {
            try {
                const userData = sessionStorage.getItem('user');
                const authData = sessionStorage.getItem('token');

                if (userData) {
                    setUser(JSON.parse(userData));
                }
                if (authData) {
                    setAuth(JSON.parse(authData));
                }
            } catch (err) {
                console.error('Error accessing electron store:', err);
            } finally {
                setIsLoading(false);
            }
        }

        loadUserToken()
    }, [])

    useEffect(() => {
        const handleBranchSwitch = (event: CustomEvent<{ user: User; token: string }>) => {
            const { user: updatedUser, token } = event.detail;
            if (updatedUser) {
                setUser(updatedUser);
                sessionStorage.setItem('user', JSON.stringify(updatedUser));
            }
            if (token) {
                setAuth({ auth: true });
                sessionStorage.setItem('token', JSON.stringify(token));
            }
        };

        window.addEventListener('branch-switched', handleBranchSwitch as EventListener);
        return () => {
            window.removeEventListener('branch-switched', handleBranchSwitch as EventListener);
        };
    }, []);

    /**
     * Update user data - used by branch switching to update user context
     */
    const updateUser = useCallback((userData: User) => {
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
    }, []);


    const signin = async (data: AuthProps) => {
        Loading.hourglass('Attempting login...', {
            backgroundColor: 'rgba(0,0,0,0.8)',
            svgColor: '#0ea5e9',
        });

        try {
            const result = await authService.login(data, (message, step, totalSteps) => {
                Loading.change(`${message} (${step}/${totalSteps})`);
            }, isDesktop);

            if (result?.token) {
                setUser(result.user);
                setAuth({ auth: true });

                sessionStorage.setItem('user', JSON.stringify(result.user));
                sessionStorage.setItem('token', JSON.stringify(result.token));

                if (result?.user?.tenantId) {
                    sessionStorage.setItem('tenantId', result.user.tenantId);
                }

                if (isElectron() && window.electronAPI?.session?.setToken) {
                    try {
                        await window.electronAPI.session.setToken(result.token);
                    } catch (err) {
                        console.warn('Failed to set session token:', err);
                    }
                }

                if (!isElectron()) {
                    await settingsService.load();
                }

                Loading.remove();
                Notify.success('Login successful!');
                return result;
            } else {
                Loading.remove();
                throw new Error('Invalid credentials');
            }

        } catch (e: any) {
            Loading.remove();
            Notify.failure(e?.message || 'Authentication failed');
            throw new Error(e?.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (data: AccountActivationProps) => {
        try {
            const result = await api.post<AccountActivationResponse>('auth/account-activation', data as any)
                .then((res) => res.data);

            if (result.token) {

                setUser(result.user);
                setAuth({ auth: true });

                sessionStorage.setItem('user', JSON.stringify(result.user));
                sessionStorage.setItem('token', JSON.stringify(result.token));

                return result;
            } else {
                throw (result.message || 'Invalid credentials');
            }
        } catch (error) {

        }
    }

    const signout = async (callback: () => void) => {
        const diagOptions = {
            title: "Are you sure?",
            text: "You are about to log out.",
            cancelButtonColor: "#3085d6",
            okButtonText: "Logout",
            cancelButtonText: "Stay logged in",
        };

        Confirm.show(
            diagOptions.title,
            diagOptions.text,
            diagOptions.okButtonText,
            diagOptions.cancelButtonText,
            async () => {
                try {
                    await api.get('auth/logout/' + user?.userId)
                        .then((async () => {
                            setUser(null);
                            setAuth(null);
                            sessionStorage.removeItem('user');
                            sessionStorage.removeItem('token');

                            // Clear session token on logout
                            if (isElectron() && window.electronAPI?.session?.clear) {
                                try {
                                    await window.electronAPI.session.clear();
                                } catch (err) {
                                    console.warn('Failed to clear session:', err);
                                }
                            }

                            if (callback) {
                                callback();
                            }
                        }))
                } catch (error) {
                    Notify.failure('Error signing out: ' + (error as any).message);
                }
            }
        );
    };

    return (
        <authContext.Provider value={{
            user,
            auth,
            isAuthenticated,
            isLoading,
            signin,
            signup,
            signout,
            updateUser,
            activeBranchId,
        }}>
            {children}
        </authContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(authContext);
}