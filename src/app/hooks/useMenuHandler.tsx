import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export function useMenuHandler() {
    const navigate = useNavigate();
    const { signout } = useAuth();

    useEffect(() => {
        if (!window.electronAPI?.menu) {
            console.log('Not running in Electron, menu handlers disabled');
            return;
        }

        const cleanupNavigate = window.electronAPI.menu.onNavigate((route: string) => {
            console.log('Menu navigation to:', route);
            navigate(route);
        });

        const cleanupModal = window.electronAPI.menu.onOpenModal((modalName: string) => {
            console.log('Menu open modal:', modalName);

            const event = new CustomEvent('open-modal', {
                detail: { modalName }
            });
            window.dispatchEvent(event);
        });

        const cleanupLogout = window.electronAPI.menu.onLogout(() => {
            console.log('Menu logout triggered');
            signout(() => navigate('/login'));
        });

        const cleanupRestore = window.electronAPI.menu.onRestoreDatabase(async (filePath: string) => {
            console.log('Menu restore database from:', filePath);

            // Implement your restore logic here
            // Example:
            // try {
            //     await restoreDatabase(filePath);
            //     alert('Database restored successfully!');
            // } catch (error) {
            //     console.error('Failed to restore database:', error);
            //     alert('Failed to restore database');
            // }
        });

        const cleanupUpdates = window.electronAPI.menu.onCheckUpdates(async () => {
            console.log('Menu check for updates triggered');

            // Implement your update check logic here
            // Example:
            // const update = await window.electronAPI.menu.checkUpdates();
            // if (update.updateAvailable) {
            //     alert(\`New version \${update.version} available!\`);
            // } else {
            //     alert('You are running the latest version');
            // }
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