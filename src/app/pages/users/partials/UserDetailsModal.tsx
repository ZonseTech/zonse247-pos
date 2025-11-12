import { Fragment, FunctionComponent } from 'react';
import { Modal } from '../../../components';
import { User2, Mail, Phone, Shield, MapPin, Clock, Key, Settings, AlertCircle } from 'lucide-react';
import { UserStatus } from '../../../utils/constants';

const UserDetailsModal: FunctionComponent<UserDetailsModalProps> = ({
    user,
    isOpen = false,
    onClose
}) => {
    if (!user) return null;

    const getStatusColor = (status?: UserStatus) => {
        switch (status) {
            case UserStatus.ACTIVE: return 'text-green-800 bg-green-100';
            case UserStatus.SUSPENDED: return 'text-red-800 bg-red-100';
            case UserStatus.INACTIVE: return 'text-gray-800 dark:text-gray-400 bg-gray-100';
            default: return 'text-gray-800 dark:text-gray-400 bg-gray-100';
        }
    };

    const getShopName = (shopUuid: string) => {
        const shopMap: Record<string, string> = {
            'shop1-uuid': 'Main Store',
            'shop2-uuid': 'Branch Store',
        };

        return shopMap[shopUuid] || 'Unknown Shop';
    };

    const formatDate = (date: Date | null | undefined) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleString();
    };

    const formatDateShort = (date: Date | null | undefined) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleDateString();
    };

    return (
        <Modal
            title="User Details"
            isOpen={isOpen}
            onClose={onClose}
            className='max-w-4xl bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6'
        >
            <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <User2 className="w-8 h-8 text-gray-500" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">{user.fullname}</h2>
                        <p className="text-gray-600">@{user.username}</p>
                        <div className="flex items-center mt-2 space-x-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status as UserStatus)}`}>
                                {user.status?.charAt(0)?.toUpperCase() + user.status?.slice(1)}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                <Shield className="w-4 h-4 mr-1" />
                                {user.roleName || 'Unknown'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-400 border-b pb-2">
                            Contact Information
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium">{user.email || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-medium">{user.phone || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Primary Shop</p>
                                    <p className="font-medium">{getShopName(user.branchId)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-400 border-b pb-2">
                            System Information
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Key className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">User ID</p>
                                    <p className="font-medium text-xs">{user.userId}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Clock className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Created</p>
                                    <p className="font-medium">{formatDateShort(user.createdAt)}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Clock className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Last Updated</p>
                                    <p className="font-medium">{formatDateShort(user.updatedAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-400 border-b pb-2">
                        Activity Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Last Login</p>
                            <p className="font-medium">{formatDate(user.lastLogin)}</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Last Logout</p>
                            <p className="font-medium">{formatDate(user.lastLogout)}</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Password Changed</p>
                            <p className="font-medium">{formatDate(user.passwordChangedAt)}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-400 border-b pb-2">
                        Permissions & Access
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Business Permissions</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm">Max Discount</span>
                                    <span className="font-medium">{user.maxDiscountPercent || 0}%</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm">Price Override</span>
                                    <span className={`font-medium ${user.canOverridePrices ? 'text-green-600' : 'text-red-600'}`}>
                                        {user.canOverridePrices ? 'Allowed' : 'Not Allowed'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm">PIN Code</span>
                                    <span className="font-medium">{user.pinCode ? 'Set' : 'Not Set'}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">System Flags</h4>
                            <div className="space-y-2">
                                {user.forcePasswordChange && (
                                    <div className="flex items-center p-2 bg-green-50 text-yellow-800 rounded">
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        <span className="text-sm">Password reset required</span>
                                    </div>
                                )}
                                {!user.forcePasswordChange && (
                                    <div className="flex items-center p-2 bg-gray-50 rounded">
                                        <span className="text-sm text-gray-600">No system flags</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {user.accessibleShops && user.accessibleShops.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-400 border-b pb-2">
                            Accessible Shops
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {user.accessibleShops.map((shopUuid, index) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {getShopName(shopUuid)}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {user.allowedWorkstations && user.allowedWorkstations.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-400 border-b pb-2">
                            Allowed Workstations
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {user.allowedWorkstations.map((workstation, index) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                                    <Settings className="w-3 h-3 mr-1" />
                                    {workstation}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default UserDetailsModal;