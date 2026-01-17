import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthProvider';
import { useBranch } from '../context/BranchContext';
import { ROUTES } from '../utils/constants';

export function useMenuHandler() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signout, user } = useAuth();
    const { accessibleBranches, currentBranch, switchBranch } = useBranch();

    useEffect(() => {
        if (!window.electronAPI?.menu) return;

        if (user) {
            const currentBranchId = currentBranch?.branchId || user?.currentBranchId || user?.branchId;
            window.electronAPI.menu.rebuild(user, accessibleBranches, currentBranchId);
        } else {
            window.electronAPI.menu.rebuild(null);
        }
    }, [user, accessibleBranches, currentBranch]);

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

        const cleanupBranchSwitch = window.electronAPI.menu.onSwitchBranch(async (data) => {
            if (data?.branchId) {
                const success = await switchBranch(data.branchId);
                if (success) {
                    window.dispatchEvent(new CustomEvent('branch-data-refresh'));

                    const currentPath = location.pathname;
                    navigate(ROUTES.POS, { replace: true });

                    setTimeout(() => {
                        if (currentPath !== ROUTES.POS) {
                            navigate(currentPath, { replace: true });
                        }
                    }, 100);
                }
            }
        });

        const cleanupUpdates = window.electronAPI.menu.onCheckUpdates(async () => {
            console.log('Menu check for updates triggered');
        });

        return () => {
            cleanupNavigate();
            cleanupModal();
            cleanupLogout();
            cleanupBranchSwitch();
            // cleanupRestore();
            cleanupUpdates();
        };
    }, [navigate, signout, switchBranch, location.pathname]);
}