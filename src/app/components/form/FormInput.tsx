import { FunctionComponent, InputHTMLAttributes } from 'react';
import Label from '../Label';
import Input from '../Input';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const FormInput: FunctionComponent<FormInputProps> = ({
    label,
    error,
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-1">
            {label && <Label>{label}</Label>}
            <Input className={className} {...props} />
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default FormInput;
