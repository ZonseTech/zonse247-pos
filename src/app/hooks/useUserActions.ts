import { Notify, Confirm } from 'notiflix';
import { UserStatus } from '../utils/constants';
import usersService from '../services/users.service';

export const useUserActions = (saveUsers: (users: User[]) => void, users: User[]) => {
    const handleDelete = async (userId: string, username: string) => {
        Confirm.show(
            'Delete User',
            `Are you sure you want to delete the user "${username}"? This action cannot be undone.`,
            'Yes, Delete',
            'Cancel',
            async () => {
                try {
                    await usersService.delete(userId);
                    const updatedUsers = users.filter(user => user.userId !== userId);
                    saveUsers(updatedUsers);
                    Notify.success('User deleted successfully');
                } catch (error) {
                    console.error('Error deleting user:', error);
                    Notify.failure('Failed to delete user');
                }
            },
            () => { },
            {
                titleColor: '#ef4444',
                okButtonBackground: '#ef4444',
            }
        );
    };

    const handleResetPassword = async (user: User) => {
        Confirm.show(
            'Reset Password',
            `Are you sure you want to force a password reset for "${user.username}"? They will be required to change their password on next login.`,
            'Yes, Reset',
            'Cancel',
            async () => {
                try {
                    await usersService.update(user.userId, {
                        forcePasswordChange: true,
                        passwordChangedAt: new Date()
                    });

                    const updatedUsers = users.map(u =>
                        u.userId === user.userId
                            ? { ...u, forcePasswordChange: true, passwordChangedAt: new Date() }
                            : u
                    );
                    saveUsers(updatedUsers);

                    Notify.success('Password reset flag set successfully');
                } catch (error) {
                    console.error('Error setting password reset:', error);
                    Notify.failure('Failed to set password reset');
                }
            },
            () => { },
            {
                titleColor: '#f59e0b',
                okButtonBackground: '#f59e0b',
            }
        );
    };

    const toggleUserStatus = async (user: User) => {
        let newStatus: UserStatus;
        let action: string;

        switch (user.status) {
            case UserStatus.ACTIVE:
                newStatus = UserStatus.SUSPENDED;
                action = 'suspend';
                break;
            case UserStatus.SUSPENDED:
                newStatus = UserStatus.ACTIVE;
                action = 'activate';
                break;
            case UserStatus.INACTIVE:
                newStatus = UserStatus.ACTIVE;
                action = 'activate';
                break;
            default:
                newStatus = UserStatus.ACTIVE;
                action = 'activate';
        }

        Confirm.show(
            `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
            `Are you sure you want to ${action} the user "${user?.username}"?`,
            `Yes, ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            'Cancel',
            async () => {
                try {
                    await usersService.update(user.userId, { status: newStatus });
                    const updatedUsers = users.map(u =>
                        u.userId === user.userId ? { ...u, status: newStatus } : u
                    );
                    saveUsers(updatedUsers);
                    Notify.success(`User ${action}d successfully`);
                } catch (error) {
                    console.error(`Error ${action}ing user:`, error);
                    Notify.failure(`Failed to ${action} user`);
                }
            },
            () => { },
            {
                titleColor: newStatus === UserStatus.SUSPENDED ? '#ef4444' : '#22c55e',
                okButtonBackground: newStatus === UserStatus.SUSPENDED ? '#ef4444' : '#22c55e',
            }
        );
    };

    return {
        handleDelete,
        handleResetPassword,
        toggleUserStatus
    };
};