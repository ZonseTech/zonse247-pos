import { FunctionComponent, ReactNode } from 'react';

interface FormFieldCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

const FormFieldCard: FunctionComponent<FormFieldCardProps> = ({
    children,
    className = '',
    onClick,
}) => (
    <div 
        className={`bg-white dark:bg-gray-800 rounded-sm shadow-none p-4 ${className}`}
        onClick={onClick}
    >
        {children}
    </div>
);

export default FormFieldCard;
