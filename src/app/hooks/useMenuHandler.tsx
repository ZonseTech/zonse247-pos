import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export function useMenuHandler() {
    const navigate = useNavigate();
    const { signout, user } = useAuth();

    useEffect(() => {
        if (!window.electronAPI?.menu) return;

        if (user) {
            window.electronAPI.menu.rebuild(user);
        } else {
            window.electronAPI.menu.rebuild(null);
        }
    }, [user]);

    useEffect(() => {
        if (!window.electronAPI?.menu) return;

        const cleanupNavigate = window.electronAPI.menu.onNavigate((route: string) => {
            navigate(route);
        });

        const cleanupModal = window.electronAPI.menu.onOpenModal((modalName: string) => {
            const event = new CustomEvent('open-modal', {
                detail: { modalName }
            });
            window.dispatchEvent(event);
        });

        const cleanupLogout = window.electronAPI.menu.onLogout(() => {
            signout(() => navigate('/login'));
        });

        const cleanupRestore = window.electronAPI.menu.onRestoreDatabase(async (filePath: string) => {
            console.log('Menu restore database from:', filePath);
        });

        const cleanupUpdates = window.electronAPI.menu.onCheckUpdates(async () => {
            console.log('Menu check for updates triggered');
        });

        return () => {
            cleanupNavigate();
            cleanupModal();
            cleanupLogout();
            cleanupRestore();
            cleanupUpdates();
        };
    }, [navigate, signout]);
}