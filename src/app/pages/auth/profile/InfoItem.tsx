import { FunctionComponent } from 'react';
import { LucideIcon } from 'lucide-react';

type Props = {
    icon: LucideIcon;
    label: string;
    value: string;
};

const InfoItem: FunctionComponent<Props> = ({ icon: Icon, label, value }) => {
    return (
        <div className="flex items-center gap-3 py-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {value}
                </p>
            </div>
        </div>
    );
};

export default InfoItem;
