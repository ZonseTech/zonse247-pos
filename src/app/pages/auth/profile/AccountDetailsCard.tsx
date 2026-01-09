import { FunctionComponent } from 'react';
import Card from '../../../components/card/Card';
import { UserIcon, MailIcon, PhoneIcon, BuildingIcon, ShieldIcon } from 'lucide-react';
import InfoItem from './InfoItem';

const formatRoleName = (role: string | null | undefined): string => {
    if (!role) return 'User';
    return role
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

type Props = {
    user: User | null;
};

const AccountDetailsCard: FunctionComponent<Props> = ({ user }) => {
    return (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Account Details
                </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                <InfoItem icon={MailIcon} label="Email" value={user?.email || 'Not set'} />
                <InfoItem icon={PhoneIcon} label="Phone" value={user?.phone || 'Not set'} />
                <InfoItem
                    icon={BuildingIcon}
                    label="Branch ID"
                    value={user?.branchId || 'Not assigned'}
                />
                <InfoItem
                    icon={ShieldIcon}
                    label="Role"
                    value={formatRoleName(user?.roleName)}
                />
            </div>
        </Card>
    );
};

export default AccountDetailsCard;
