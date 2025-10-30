import { FunctionComponent } from "react";

const StatusBadge: FunctionComponent<{ status: string }> = ({ status }) => {
    const statusColors = {
        activated: 'bg-green-100 text-green-800',
        active: 'bg-green-100 text-green-800',
        maintenance: 'bg-orange-100 text-orange-800',
        inactive: 'bg-red-100 text-red-800'
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs ${statusColors[(status ?? '')?.toLowerCase()] || statusColors.inactive}`}>
            {status}
        </span>
    );
};

export default StatusBadge