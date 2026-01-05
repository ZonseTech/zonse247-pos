import { FunctionComponent, SelectHTMLAttributes } from 'react';
import Label from '../Label';
import Select from '../Select';

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
}

const FormSelect: FunctionComponent<FormSelectProps> = ({
    label,
    error,
    children,
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-1">
            {label && <Label>{label}</Label>}
            <Select className={className} {...props}>
                {children}
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default FormSelect;
