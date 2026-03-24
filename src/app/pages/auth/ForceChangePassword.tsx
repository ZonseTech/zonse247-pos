import { FunctionComponent, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Notify } from 'notiflix';
import { ShieldAlertIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';
import { useIsNativeMobile } from '../../hooks/useMediaQuery';
import { ChangePasswordForm } from './profile';
import { MobileChangePasswordForm } from './profile';
import usersService from '../../services/users.service';
import { ROUTES } from '../../utils/constants';

/**
 * Dedicated force-change-password page.
 *
 * Shown when `forcePasswordChange` is set to true on the user record
 * (e.g. an admin reset the password and the change was synced down).
 *
 * The user cannot navigate away until they successfully change their
 * password. On success the flag is cleared and they are redirected to
 * the POS.
 */
const ForceChangePassword: FunctionComponent = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const isNativeMobile = useIsNativeMobile();

    const handleSuccess = useCallback(async () => {
        try {
            if (user?.userId) {
                const freshUser = await usersService.show(user.userId);
                updateUser({ ...freshUser, forcePasswordChange: false });
            }
        } catch {
            // 
        }

        Notify.success('Password changed successfully. You may continue.');
        navigate(ROUTES.POS, { replace: true });
    }, [user?.userId, updateUser, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="w-full max-w-lg">
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-600 dark:bg-amber-900/30 p-4">
                    <ShieldAlertIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                        <h2 className="text-base font-semibold text-amber-800 dark:text-amber-200">
                            Password Reset Required
                        </h2>
                        <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                            Your password was reset by an administrator. Please set a new
                            password to continue using the application.
                        </p>
                    </div>
                </div>

                {isNativeMobile ? (
                    <MobileChangePasswordForm
                        userId={user?.userId || ''}
                        onSuccess={handleSuccess}
                    />
                ) : (
                    <ChangePasswordForm userId={user?.userId || ''} />
                )}
            </div>
        </div>
    );
};

export default ForceChangePassword;
