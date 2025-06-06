import api from '../services/http.service';
import { Confirm, Notify } from 'notiflix';
import React, { type PropsWithChildren, createContext, useContext, useEffect, useState } from 'react'

type ContextProps = {
    user: any;
    auth: any;
    isLoading: boolean;
    signin: (cb: AuthProps) => Promise<LoginResponse>;
    signout: (callback: () => void) => void;
}

const authContext = createContext<ContextProps>({
    user: null,
    auth: null,
    isLoading: false,
    signin: async () => ({} as Promise<LoginResponse>),
    signout: async () => ({
        // 
    } as any),
});

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [auth, setAuth] = useState<string | unknown>(null);
    const [user, setUser] = useState<AuthUser | unknown>(null);

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
                // if (!auth) {
                //     await api.get('users/check')
                // }
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
            const result = await api.post<LoginResponse>('users/login', data as any)
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
            throw new Error(error?.toString() as string);
        } finally {
            setIsLoading(false);
        }
    };

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
                    await api.get('users/logout/' + (user as User).uuid)
                        .then((() => {
                            setUser(null);
                            setAuth(null);
                            sessionStorage.removeItem('user');
                            sessionStorage.removeItem('token');

                            if (callback) {
                                callback();
                                location.reload();
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
            isLoading,
            signin,
            signout,
        }}>
            {children}
        </authContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(authContext);
}