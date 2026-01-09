import { FunctionComponent } from 'react';
import Card from '../../../components/card/Card';
import { ClockIcon } from 'lucide-react';

const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

type Props = {
    user: User | null;
};

const ActivityCard: FunctionComponent<Props> = ({ user }) => {
    return (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <ClockIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Activity
                </h3>
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Last Login
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(user?.lastLogin)}
                    </span>
                </div>
                <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Last Logout
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(user?.lastLogout)}
                    </span>
                </div>
                <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Password Changed
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(user?.passwordChangedAt)}
                    </span>
                </div>
                <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Account Created
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(user?.createdAt)}
                    </span>
                </div>
            </div>
        </Card>
    );
};

export default ActivityCard;
