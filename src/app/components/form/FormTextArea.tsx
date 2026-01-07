import { FunctionComponent, TextareaHTMLAttributes } from 'react';
import Label from '../Label';
import Textarea from '../Textarea';

interface FormTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

const FormTextArea: FunctionComponent<FormTextAreaProps> = ({
    label,
    error,
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-1">
            {label && <Label>{label}</Label>}
            <Textarea className={className} {...props} />
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default FormTextArea;
