import classNames from 'classnames';
import { useState, useEffect, FunctionComponent } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
    className?: string;
    iconClassName?: string;
    dateClassName?: string;
    timeClassName?: string;
    showIcon?: boolean;
    showDate?: boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatDate = (date: Date) => {
    return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
};

const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

const Timer: FunctionComponent<TimerProps> = ({
    className,
    iconClassName,
    dateClassName,
    timeClassName,
    showIcon = true,
    showDate = true
}) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={classNames('flex items-center gap-1.5', className)}>
            {showIcon && <Clock className={iconClassName || 'w-5 h-5'} />}
            <div className="flex items-baseline gap-1.5 leading-none">
                {showDate && (
                    <span className={classNames('font-normal opacity-80', dateClassName)}>
                        {formatDate(currentTime)}
                    </span>
                )}
                {showDate && <span className="opacity-30">&middot;</span>}
                <span className={classNames('font-mono tabular-nums tracking-tight', timeClassName)}>
                    {formatTime(currentTime)}
                </span>
            </div>
        </div>
    );
};

export default Timer;
