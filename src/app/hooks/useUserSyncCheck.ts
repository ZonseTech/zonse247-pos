import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthProvider';
import usersService from '../services/users.service';
import { ROUTES } from '../utils/constants';

/**
 * Sync-aware user status check hook.
 *
 * After each sync cycle the SyncJobService may pull user changes made on the
 * server (e.g. admin deactivated the account or force-reset the password).
 *
 * This hook periodically re-reads the logged-in user from the LOCAL database
 * and reacts to two scenarios:
 *
 *  1. `status !== 'active'`        → force logout
 *  2. `forcePasswordChange === true` → redirect to /change-password
 *
 * See: USER_SYNC_FRONTEND_GUIDE.txt §3A
 */

const CHECK_INTERVAL_MS = 30_000;

export const useUserSyncCheck = () => {
    const { user, forceSignout, updateUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isCheckingRef = useRef(false);

    const performCheck = useCallback(async () => {
        if (!user?.userId || isCheckingRef.current) return;

        isCheckingRef.current = true;

        try {
            const freshUser = await usersService.show(user.userId);

            if (freshUser.status && freshUser.status !== 'active') {
                forceSignout(
                    'Your account has been deactivated. Contact your admin.'
                );
                return;
            }

            if (freshUser.forcePasswordChange) {
                updateUser(freshUser);

                if (location.pathname !== ROUTES.CHANGE_PASSWORD) {
                    navigate(ROUTES.CHANGE_PASSWORD, { replace: true });
                }
                return;
            }

            const hasChanges =
                freshUser.username !== user.username ||
                freshUser.fullname !== user.fullname ||
                freshUser.roleId !== user.roleId ||
                freshUser.status !== user.status ||
                freshUser.email !== user.email ||
                freshUser.phone !== user.phone;

            if (hasChanges) {
                updateUser(freshUser);
            }
        } catch (error) {
            console.warn('[useUserSyncCheck] Check failed:', error);
        } finally {
            isCheckingRef.current = false;
        }
    }, [user, forceSignout, updateUser, navigate, location.pathname]);

    useEffect(() => {
        if (!user?.userId) return;

        performCheck();

        timerRef.current = setInterval(performCheck, CHECK_INTERVAL_MS);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                performCheck();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );
        };
    }, [user?.userId, performCheck]);
};
