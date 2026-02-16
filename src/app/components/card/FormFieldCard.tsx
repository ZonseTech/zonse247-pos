import { FunctionComponent, ReactNode } from 'react';

interface FormFieldCardProps {
    children: ReactNode;
    title?: string;
    className?: string;
    onClick?: () => void;
}

const FormFieldCard: FunctionComponent<FormFieldCardProps> = ({
    children,
    title,
    className = '',
    onClick,
}) => (
    <div 
        className={`bg-white dark:bg-gray-800 rounded-sm shadow-none p-4 ${className}`}
        onClick={onClick}
    >
        {title && (
            <h3 className="text-lg font-semibold text-sky-500 mb-6">
                {title}
            </h3>
        )}
        {children}
    </div>
);

export default FormFieldCard;
