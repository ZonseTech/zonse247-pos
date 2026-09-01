import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthProvider';
import { useBranch } from '../context/BranchContext';
import { ROUTES } from '../utils/constants';

export function useMenuHandler() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signout, user } = useAuth();
    const { currentBranch } = useBranch();

    const hiddenNavItemIds = currentBranch?.branchPreferences?.navigation?.hiddenNavItemIds ?? [];

    useEffect(() => {
        if (!window.electronAPI?.menu) return;

        if (user) {
            window.electronAPI.menu.rebuild(user, currentBranch?.businessType ?? null, hiddenNavItemIds);
        } else {
            window.electronAPI.menu.rebuild(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, currentBranch?.businessType, JSON.stringify(hiddenNavItemIds)]);

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
            signout(() => navigate(ROUTES.LOGIN, { replace: true }));
        });

        const cleanupUpdates = window.electronAPI.menu.onCheckUpdates(async () => {
            console.log('Menu check for updates triggered');
        });

        return () => {
            cleanupNavigate();
            cleanupModal();
            cleanupLogout();
            cleanupUpdates();
        };
    }, [navigate, signout, location.pathname]);
}