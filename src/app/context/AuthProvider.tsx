import api from '../services/http.service';
import { Confirm, Notify } from 'notiflix';
import React, { type PropsWithChildren, createContext, useContext, useEffect, useState } from 'react'
import { isElectron } from '../utils';
import settingsService from '../services/settings.service';

type ContextProps = {
    user: User | null;
    auth: any;
    isAuthenticated: boolean;
    isLoading: boolean;
    signin: (cb: AuthProps) => Promise<LoginResponse>;
    signup: (cb: AccountActivationProps) => Promise<AccountActivationResponse>;
    signout: (callback: () => void) => void;
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
});

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [auth, setAuth] = useState<string | unknown>(null);
    const [user, setUser] = useState<User | null>(null);
    const isAuthenticated = !!(user && auth);

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

    const signin = async (data: AuthProps) => {
        try {
            const result = await api.post<ApiResponse<LoginResponse>>('auth/login', data as any)
                .then((res) => res.data);

            if (result?.data.token) {
                setUser(result?.data.user);
                setAuth({ auth: true });

                sessionStorage.setItem('user', JSON.stringify(result?.data.user));
                sessionStorage.setItem('token', JSON.stringify(result?.data.token));

                if (result?.data?.user?.tenantId) {
                    sessionStorage.setItem('tenantId', result?.data.user.tenantId);
                }

                if (!isElectron()) {
                    await settingsService.load();
                }

                return result.data;
            } else {
                throw (result.message || 'Invalid credentials');
            }

        } catch (e) {
            throw new Error(e?.error?.response?.data?.message || e?.message?.toString() as string);
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
                        .then((() => {
                            setUser(null);
                            setAuth(null);
                            sessionStorage.removeItem('user');
                            sessionStorage.removeItem('token');

                            if (callback) {
                                callback();
                                // location.reload();
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
        }}>
            {children}
        </authContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(authContext);
}