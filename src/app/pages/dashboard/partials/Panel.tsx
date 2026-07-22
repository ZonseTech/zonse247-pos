import type { FunctionComponent, ReactNode } from 'react';

export interface PanelProps {
    title: string;
    icon: ReactNode;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}

const Panel: FunctionComponent<PanelProps> = ({ title, icon, action, children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm ${className}`}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2.5">
                <span className="text-gray-400 dark:text-gray-500">{icon}</span>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
            </div>
            {action}
        </div>
        <div className="px-5 pb-5">{children}</div>
    </div>
);

export default Panel;
