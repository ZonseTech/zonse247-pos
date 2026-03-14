import React from 'react';
import { useField, useFormikContext } from 'formik';
import Select, { SingleValue, StylesConfig } from 'react-select';
import Label from './Label';
import HelperText from './HelperText';
import { useIsMobile } from '../hooks/useMediaQuery';

interface Option {
    value: string | number;
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
    const isMobile = useIsMobile();

    const selectedOption = options.find((option) => {
        if (!field.value) return false;
        return String(option.value).toLowerCase() === String(field.value).toLowerCase();
    }) || null;

    const handleChange = (option: SingleValue<Option>) => {
        setFieldValue(name, option ? option.value : '', true);
    };

    const handleBlur = () => {
        setFieldTouched(name, true);
    };

    // Mobile styles - matching FormInput mobile styling (bg-gray-100, no border)
    const mobileStyles: StylesConfig<Option, false> = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: '#f3f4f6', // bg-gray-100
            borderColor: meta.touched && meta.error ? '#ef4444' : 'transparent',
            borderWidth: meta.touched && meta.error ? '1px' : '0',
            borderRadius: '0.125rem', // rounded-sm
            padding: '0.25rem 0.5rem',
            boxShadow: 'none',
            minHeight: '42px',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: '#f3f4f6',
            borderRadius: '0.125rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 9999,
        }),
        menuPortal: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: '200px',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#0ea5e9'
                : state.isFocused
                    ? '#e5e7eb'
                    : 'transparent',
            color: state.isSelected ? 'white' : '#27272a', // text-zinc-800
            cursor: 'pointer',
            '&:active': {
                backgroundColor: '#38bdf8',
            },
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#27272a', // text-zinc-800
        }),
        input: (provided) => ({
            ...provided,
            color: '#27272a', // text-zinc-800
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#a1a1aa', // placeholder-zinc-400
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? '#0ea5e9' : '#a1a1aa',
            '&:hover': {
                color: '#0ea5e9',
            },
        }),
        clearIndicator: (provided) => ({
            ...provided,
            color: '#a1a1aa',
            '&:hover': {
                color: '#ef4444',
            },
        }),
        noOptionsMessage: (provided) => ({
            ...provided,
            color: '#a1a1aa',
        }),
    };

    // Mobile dark mode styles
    const mobileDarkStyles: StylesConfig<Option, false> = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: '#27272a', // dark:bg-zinc-800
            borderColor: meta.touched && meta.error ? '#ef4444' : 'transparent',
            borderWidth: meta.touched && meta.error ? '1px' : '0',
            borderRadius: '0.125rem',
            padding: '0.25rem 0.5rem',
            boxShadow: 'none',
            minHeight: '42px',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: '#27272a',
            borderRadius: '0.125rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
            zIndex: 9999,
        }),
        menuPortal: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: '200px',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#0ea5e9'
                : state.isFocused
                    ? '#3f3f46'
                    : 'transparent',
            color: state.isSelected ? 'white' : '#f4f4f5', // dark:text-zinc-100
            cursor: 'pointer',
            '&:active': {
                backgroundColor: '#38bdf8',
            },
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#f4f4f5', // dark:text-zinc-100
        }),
        input: (provided) => ({
            ...provided,
            color: '#f4f4f5',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#71717a', // dark:placeholder-zinc-500
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? '#0ea5e9' : '#71717a',
            '&:hover': {
                color: '#0ea5e9',
            },
        }),
        clearIndicator: (provided) => ({
            ...provided,
            color: '#71717a',
            '&:hover': {
                color: '#ef4444',
            },
        }),
        noOptionsMessage: (provided) => ({
            ...provided,
            color: '#71717a',
        }),
    };

    // Desktop styles (white bg with border)
    const customStyles: StylesConfig<Option, false> = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'var(--select-bg, white)',
            borderColor: meta.touched && meta.error
                ? '#ef4444'
                : state.isFocused
                    ? '#0ea5e9'
                    : '#d1d5db',
            borderRadius: '0.s75rem',
            padding: '0.25rem',
            boxShadow: state.isFocused ? '0 0 0 1px #0ea5e9' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? '#0ea5e9' : '#9ca3af',
            },
            minHeight: '42px',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'var(--select-menu-bg, white)',
            borderRadius: '0.s75rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 9999,
        }),
        menuPortal: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: '200px',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#0ea5e9'
                : state.isFocused
                    ? '#e0f2fe'
                    : 'transparent',
            color: state.isSelected ? 'white' : 'var(--select-text, #374151)',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: '#38bdf8',
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
            color: state.isFocused ? '#0ea5e9' : '#9ca3af',
            '&:hover': {
                color: '#0ea5e9',
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
                    ? '#0ea5e9'
                    : '#4b5563',
            borderRadius: '0.275rem',
            padding: '0.25rem',
            boxShadow: state.isFocused ? '0 0 0 1px #0ea5e9' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? '#0ea5e9' : '#6b7280',
            },
            minHeight: '42px',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: '#374151',
            borderRadius: '0.275rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
            zIndex: 9999,
        }),
        menuPortal: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: '200px',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#0ea5e9'
                : state.isFocused
                    ? '#4b5563'
                    : 'transparent',
            color: state.isSelected ? 'white' : '#e5e7eb',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: '#38bdf8',
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
            color: state.isFocused ? '#0ea5e9' : '#9ca3af',
            '&:hover': {
                color: '#0ea5e9',
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

    // Select appropriate styles based on mobile/desktop and dark mode
    const getStyles = () => {
        if (isMobile) {
            return isDarkMode ? mobileDarkStyles : mobileStyles;
        }
        return isDarkMode ? darkModeStyles : customStyles;
    };

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
                styles={getStyles()}
                classNamePrefix="react-select"
                noOptionsMessage={() => 'No options found'}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
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
