import React from 'react';
import { useField, useFormikContext } from 'formik';
import Select, { SingleValue, StylesConfig } from 'react-select';
import Label from './Label';
import HelperText from './HelperText';

interface Option {
    value: string;
    label: string;
}

interface FormSearchableSelectProps {
    label: string;
    id?: string;
    disabled?: boolean;
    name: string;
    required?: boolean;
    options: Option[];
    placeholder?: string;
    isClearable?: boolean;
    isLoading?: boolean;
}

const FormSearchableSelect: React.FC<FormSearchableSelectProps> = ({
    label,
    id,
    name,
    required,
    options,
    placeholder = 'Search and select...',
    disabled = false,
    isClearable = true,
    isLoading = false,
}) => {
    const [field, meta] = useField(name);
    const { setFieldValue, setFieldTouched } = useFormikContext();

    const selectedOption = options.find((option) => option.value === field.value) || null;

    const handleChange = (option: SingleValue<Option>) => {
        setFieldValue(name, option ? option.value : '');
    };

    const handleBlur = () => {
        setFieldTouched(name, true);
    };

    const customStyles: StylesConfig<Option, false> = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'var(--select-bg, white)',
            borderColor: meta.touched && meta.error
                ? '#ef4444'
                : state.isFocused
                    ? '#6366f1'
                    : '#d1d5db',
            borderRadius: '0.375rem',
            padding: '0.25rem',
            boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? '#6366f1' : '#9ca3af',
            },
            minHeight: '42px',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'var(--select-menu-bg, white)',
            borderRadius: '0.375rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 50,
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: '200px',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#6366f1'
                : state.isFocused
                    ? '#e0e7ff'
                    : 'transparent',
            color: state.isSelected ? 'white' : 'var(--select-text, #374151)',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: '#818cf8',
            },
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'var(--select-text, #374151)',
        }),
        input: (provided) => ({
            ...provided,
            color: 'var(--select-text, #374151)',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#9ca3af',
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? '#6366f1' : '#9ca3af',
            '&:hover': {
                color: '#6366f1',
            },
        }),
        clearIndicator: (provided) => ({
            ...provided,
            color: '#9ca3af',
            '&:hover': {
                color: '#ef4444',
            },
        }),
        noOptionsMessage: (provided) => ({
            ...provided,
            color: '#9ca3af',
        }),
    };

    // Dark mode styles override
    const darkModeStyles: StylesConfig<Option, false> = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: '#374151',
            borderColor: meta.touched && meta.error
                ? '#ef4444'
                : state.isFocused
                    ? '#6366f1'
                    : '#4b5563',
            borderRadius: '0.375rem',
            padding: '0.25rem',
            boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? '#6366f1' : '#6b7280',
            },
            minHeight: '42px',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: '#374151',
            borderRadius: '0.375rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
            zIndex: 50,
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: '200px',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#6366f1'
                : state.isFocused
                    ? '#4b5563'
                    : 'transparent',
            color: state.isSelected ? 'white' : '#e5e7eb',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: '#818cf8',
            },
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#e5e7eb',
        }),
        input: (provided) => ({
            ...provided,
            color: '#e5e7eb',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#9ca3af',
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? '#6366f1' : '#9ca3af',
            '&:hover': {
                color: '#6366f1',
            },
        }),
        clearIndicator: (provided) => ({
            ...provided,
            color: '#9ca3af',
            '&:hover': {
                color: '#ef4444',
            },
        }),
        noOptionsMessage: (provided) => ({
            ...provided,
            color: '#9ca3af',
        }),
    };

    // Check if dark mode is active
    const isDarkMode = typeof window !== 'undefined' &&
        document.documentElement.classList.contains('dark');

    return (
        <div>
            <Label htmlFor={id || name}>
                {label} {required && <span className="text-red-500">*</span>}
            </Label>

            <Select<Option, false>
                inputId={id || name}
                name={name}
                value={selectedOption}
                onChange={handleChange}
                onBlur={handleBlur}
                options={options}
                placeholder={placeholder}
                isDisabled={disabled}
                isClearable={isClearable}
                isLoading={isLoading}
                isSearchable={true}
                styles={isDarkMode ? darkModeStyles : customStyles}
                classNamePrefix="react-select"
                noOptionsMessage={() => 'No options found'}
                filterOption={(option, searchText) => {
                    if (!searchText) return true;
                    return option.label.toLowerCase().includes(searchText.toLowerCase());
                }}
            />

            {meta.touched && meta.error ? (
                <HelperText valid={false}>{meta.error}</HelperText>
            ) : null}
        </div>
    );
};

export default FormSearchableSelect;
