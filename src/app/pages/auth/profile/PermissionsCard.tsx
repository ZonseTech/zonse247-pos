import { FunctionComponent, useState, useMemo } from 'react';
import Card from '../../../components/card/Card';
import { ShieldIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

type Props = {
    permissions: string[] | null | undefined;
};

const groupPermissions = (permissions: string[] | null | undefined): Record<string, string[]> => {
    if (!permissions) return {};
    return permissions.reduce(
        (acc, perm) => {
            const [category] = perm.split('.');
            if (!acc[category]) acc[category] = [];
            acc[category].push(perm);
            return acc;
        },
        {} as Record<string, string[]>
    );
};

const PermissionsCard: FunctionComponent<Props> = ({ permissions }) => {
    const [showPermissions, setShowPermissions] = useState(false);

    const groupedPermissions = useMemo(
        () => groupPermissions(permissions),
        [permissions]
    );

    return (
        <Card className="p-6">
            <button
                type="button"
                onClick={() => setShowPermissions(!showPermissions)}
                className="w-full flex items-center justify-between"
            >
                <div className="flex items-center gap-2">
                    <ShieldIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Permissions
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                        {permissions?.length || 0}
                    </span>
                </div>
                {showPermissions ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                )}
            </button>

            {showPermissions && (
                <div className="mt-6 space-y-4">
                    {Object.entries(groupedPermissions).map(([category, perms]) => (
                        <div key={category}>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize mb-2">
                                {category}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {perms.map((perm) => (
                                    <span
                                        key={perm}
                                        className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300"
                                    >
                                        {perm.split('.').slice(1).join('.')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default PermissionsCard;
