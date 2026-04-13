import { useEffect, useRef, useCallback } from 'react';
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

/** Read current hash path without React Router dependency */
const getCurrentPath = () => window.location.hash.replace('#', '') || '/';

/** Navigate via hash — works anywhere, no Router context needed */
const hashNavigate = (path: string) => { window.location.hash = `#${path}`; };

export const useUserSyncCheck = () => {
    const { user, forceSignout, updateUser } = useAuth();
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isCheckingRef = useRef(false);
    const userRef = useRef(user);
    userRef.current = user;

    const performCheck = useCallback(async () => {
        const currentUser = userRef.current;
        if (!currentUser?.userId || isCheckingRef.current) return;

        isCheckingRef.current = true;

        try {
            const freshUser = await usersService.show(currentUser.userId);

            if (freshUser.status && freshUser.status !== 'active') {
                forceSignout(
                    'Your account has been deactivated. Contact your admin.'
                );
                return;
            }

            if (freshUser.forcePasswordChange) {
                updateUser(freshUser);

                if (getCurrentPath() !== ROUTES.CHANGE_PASSWORD) {
                    hashNavigate(ROUTES.CHANGE_PASSWORD);
                }
                return;
            }

            const hasChanges =
                freshUser.username !== currentUser.username ||
                freshUser.fullname !== currentUser.fullname ||
                freshUser.roleId !== currentUser.roleId ||
                freshUser.status !== currentUser.status ||
                freshUser.email !== currentUser.email ||
                freshUser.phone !== currentUser.phone;

            if (hasChanges) {
                updateUser(freshUser);
            }
        } catch (error) {
            console.warn('[useUserSyncCheck] Check failed:', error);
        } finally {
            isCheckingRef.current = false;
        }
    }, [forceSignout, updateUser]);

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
