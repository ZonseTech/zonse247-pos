import React from 'react';
import { useField } from 'formik';
import Textarea from './Textarea';
import Label from './Label';
import HelperText from './HelperText';
import classNames from 'classnames';

interface TextAreaProps {
    label: string;
    id?: string;
    name: string;
    required?: boolean;
    wrapperClass?: string;
    rows?: number;
}

const FormTextArea: React.FC<TextAreaProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
    label,
    id,
    name,
    required,
    wrapperClass,
    rows = 4,
    ...props
}) => {
    const [field, meta] = useField({ ...props, name });

    return (
        <div className={classNames(wrapperClass, '')}>
            <Label htmlFor={id || name}>
                {label} {required && <span className='text-red-500'>*</span>}
            </Label>
            <Textarea
                {...field}
                {...props}
                id={id || name}
                rows={rows}
            />
            {meta.touched && meta.error ? (
                <HelperText valid={false}>
                    {meta.error}
                </HelperText>
            ) : null}
        </div>
    );
};

export default FormTextArea;