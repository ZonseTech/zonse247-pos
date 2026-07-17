import { FunctionComponent, ReactNode } from 'react';

interface FormFieldCardProps {
    children: ReactNode;
    title?: string;
    /** Optional control rendered on the right side of the title row (e.g. an "Edit" link) */
    headerAction?: ReactNode;
    className?: string;
    onClick?: () => void;
}

const FormFieldCard: FunctionComponent<FormFieldCardProps> = ({
    children,
    title,
    headerAction,
    className = '',
    onClick,
}) => (
    <div
        className={`bg-white dark:bg-gray-800 rounded-sm shadow-none p-4 ${className}`}
        onClick={onClick}
    >
        {(title || headerAction) && (
            <div className="flex items-center justify-between mb-6">
                {title && (
                    <h3 className="text-lg font-semibold text-sky-500">
                        {title}
                    </h3>
                )}
                {headerAction}
            </div>
        )}
        {children}
    </div>
);

export default FormFieldCard;
