import { FunctionComponent } from 'react';
import { CheckCircle2, Clock, Loader, SkipForward, XCircle } from 'lucide-react';

interface StatusIconProps {
    status: OnboardingStepStatus;
    size?: 'sm' | 'lg';
}

/**
 * Renders an icon representing the step status
 */
const StatusIcon: FunctionComponent<StatusIconProps> = ({ status, size = 'sm' }) => {
    const sizeClass = size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';

    switch (status) {
        case 'COMPLETED':
            return <CheckCircle2 className={`${sizeClass} text-green-500`} />;
        case 'FAILED':
            return <XCircle className={`${sizeClass} text-red-500`} />;
        case 'SKIPPED':
            return <SkipForward className={`${sizeClass} text-gray-400`} />;
        case 'IN_PROGRESS':
            return <Loader className={`${sizeClass} text-sky-500 animate-spin`} />;
        default:
            return <Clock className={`${sizeClass} text-gray-300`} />;
    }
};

export default StatusIcon;
