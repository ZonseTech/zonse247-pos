import React, { useCallback, useRef } from 'react';
import { useField, useFormikContext } from 'formik';
import AsyncSelect from 'react-select/async';
import { SingleValue, StylesConfig } from 'react-select';
import Label from './Label';
import HelperText from './HelperText';
import { useIsMobile } from '../hooks/useMediaQuery';

interface Option {
    value: string | number;
    label: string;
}

interface FormAsyncSearchSelectProps {
    label: string;
    id?: string;
    disabled?: boolean;
    name: string;
    required?: boolean;
    placeholder?: string;
    isClearable?: boolean;
    loadOptions: (inputValue: string) => Promise<Option[]>;
    defaultOptions?: Option[] | boolean;
    debounceMs?: number;
    minChars?: number;
    /** Pre-selected option to display (needed since async select can't resolve value from options prop alone) */
    initialOption?: Option | null;
}

const FormAsyncSearchSelect: React.FC<FormAsyncSearchSelectProps> = ({
    label,
    id,
    name,
    required,
    placeholder = 'Type to search...',
    disabled = false,
    isClearable = true,
    loadOptions,
    defaultOptions = [],
    debounceMs = 350,
    minChars = 2,
    initialOption = null,
}) => {
    const [field, meta] = useField(name);
    const { setFieldValue, setFieldTouched } = useFormikContext();
    const isMobile = useIsMobile();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const selectedOptionRef = useRef<Option | null>(initialOption);

    // Track the currently selected option so AsyncSelect can display it
    if (initialOption && !selectedOptionRef.current) {
        selectedOptionRef.current = initialOption;
    }

    const handleChange = (option: SingleValue<Option>) => {
        selectedOptionRef.current = option || null;
        setFieldValue(name, option ? option.value : '', true);
    };

    const handleBlur = () => {
        setFieldTouched(name, true);
    };

    // Debounced loadOptions with minimum character enforcement
    const debouncedLoadOptions = useCallback(
        (inputValue: string, callback: (options: Option[]) => void) => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            if (inputValue.length < minChars) {
                callback([]);
                return;
            }

            debounceRef.current = setTimeout(async () => {
                try {
                    const results = await loadOptions(inputValue);
                    callback(results);
                } catch {
                    callback([]);
                }
            }, debounceMs);
        },
        [loadOptions, debounceMs, minChars]
    );

    const noOptionsMessage = (obj: { inputValue: string }) => {
        if (!obj.inputValue || obj.inputValue.length < minChars) {
            return `Type at least ${minChars} characters to search...`;
        }
        return 'No results found';
    };

    // Resolve the displayed value — AsyncSelect needs an Option object, not just a string
    const currentValue = (() => {
        if (!field.value) return null;
        if (
            selectedOptionRef.current &&
            String(selectedOptionRef.current.value) === String(field.value)
        ) {
            return selectedOptionRef.current;
        }
        return null;
    })();

    // --- Styles (identical to FormSearchableSelect for visual consistency) ---

    const mobileStyles: StylesConfig<Option, false> = {
        control: (provided) => ({
            ...provided,
            backgroundColor: '#f3f4f6',
            borderColor: meta.touched && meta.error ? '#ef4444' : 'transparent',
            borderWidth: meta.touched && meta.error ? '1px' : '0',
            borderRadius: '0.125rem',
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
        menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
        menuList: (provided) => ({ ...provided, maxHeight: '200px' }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#0ea5e9' : state.isFocused ? '#e5e7eb' : 'transparent',
            color: state.isSelected ? 'white' : '#27272a',
            cursor: 'pointer',
            '&:active': { backgroundColor: '#38bdf8' },
        }),
        singleValue: (provided) => ({ ...provided, color: '#27272a' }),
        input: (provided) => ({ ...provided, color: '#27272a' }),
        placeholder: (provided) => ({ ...provided, color: '#a1a1aa' }),
        indicatorSeparator: () => ({ display: 'none' }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? '#0ea5e9' : '#a1a1aa',
            '&:hover': { color: '#0ea5e9' },
        }),
        clearIndicator: (provided) => ({
            ...provided,
            color: '#a1a1aa',
            '&:hover': { color: '#ef4444' },
        }),
        noOptionsMessage: (provided) => ({ ...provided, color: '#a1a1aa' }),
    };

    const mobileDarkStyles: StylesConfig<Option, false> = {
        control: (provided) => ({
            ...provided,
            backgroundColor: '#27272a',
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
        menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
        menuList: (provided) => ({ ...provided, maxHeight: '200px' }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#0ea5e9' : state.isFocused ? '#3f3f46' : 'transparent',
            color: state.isSelected ? 'white' : '#f4f4f5',
            cursor: 'pointer',
            '&:active': { backgroundColor: '#38bdf8' },
        }),
        singleValue: (provided) => ({ ...provided, color: '#f4f4f5' }),
        input: (provided) => ({ ...provided, color: '#f4f4f5' }),
        placeholder: (provided) => ({ ...provided, color: '#71717a' }),
        indicatorSeparator: () => ({ display: 'none' }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? '#0ea5e9' : '#71717a',
            '&:hover': { color: '#0ea5e9' },
        }),
        clearIndicator: (provided) => ({
            ...provided,
            color: '#71717a',
            '&:hover': { color: '#ef4444' },
        }),
        noOptionsMessage: (provided) => ({ ...provided, color: '#71717a' }),
    };

    const customStyles: StylesConfig<Option, false> = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'var(--select-bg, white)',
            borderColor: meta.touched && meta.error ? '#ef4444' : state.isFocused ? '#0ea5e9' : '#d1d5db',
            borderRadius: '0.s75rem',
            padding: '0.25rem',
            boxShadow: state.isFocused ? '0 0 0 1px #0ea5e9' : 'none',
            '&:hover': { borderColor: state.isFocused ? '#0ea5e9' : '#9ca3af' },
            minHeight: '42px',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'var(--select-menu-bg, white)',
            borderRadius: '0.s75rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 9999,
        }),
        menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
        menuList: (provided) => ({ ...provided, maxHeight: '200px' }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#0ea5e9' : state.isFocused ? '#e0f2fe' : 'transparent',
            color: state.isSelected ? 'white' : 'var(--select-text, #374151)',
            cursor: 'pointer',
            '&:active': { backgroundColor: '#38bdf8' },
        }),
        singleValue: (provided) => ({ ...provided, color: 'var(--select-text, #374151)' }),
        input: (provided) => ({ ...provided, color: 'var(--select-text, #374151)' }),
        placeholder: (provided) => ({ ...provided, color: '#9ca3af' }),
        indicatorSeparator: () => ({ display: 'none' }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? '#0ea5e9' : '#9ca3af',
            '&:hover': { color: '#0ea5e9' },
        }),
        clearIndicator: (provided) => ({
            ...provided,
            color: '#9ca3af',
            '&:hover': { color: '#ef4444' },
        }),
        noOptionsMessage: (provided) => ({ ...provided, color: '#9ca3af' }),
    };

    const darkModeStyles: StylesConfig<Option, false> = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: '#374151',
            borderColor: meta.touched && meta.error ? '#ef4444' : state.isFocused ? '#0ea5e9' : '#4b5563',
            borderRadius: '0.275rem',
            padding: '0.25rem',
            boxShadow: state.isFocused ? '0 0 0 1px #0ea5e9' : 'none',
            '&:hover': { borderColor: state.isFocused ? '#0ea5e9' : '#6b7280' },
            minHeight: '42px',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: '#374151',
            borderRadius: '0.275rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
            zIndex: 9999,
        }),
        menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
        menuList: (provided) => ({ ...provided, maxHeight: '200px' }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#0ea5e9' : state.isFocused ? '#4b5563' : 'transparent',
            color: state.isSelected ? 'white' : '#e5e7eb',
            cursor: 'pointer',
            '&:active': { backgroundColor: '#38bdf8' },
        }),
        singleValue: (provided) => ({ ...provided, color: '#e5e7eb' }),
        input: (provided) => ({ ...provided, color: '#e5e7eb' }),
        placeholder: (provided) => ({ ...provided, color: '#9ca3af' }),
        indicatorSeparator: () => ({ display: 'none' }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? '#0ea5e9' : '#9ca3af',
            '&:hover': { color: '#0ea5e9' },
        }),
        clearIndicator: (provided) => ({
            ...provided,
            color: '#9ca3af',
            '&:hover': { color: '#ef4444' },
        }),
        noOptionsMessage: (provided) => ({ ...provided, color: '#9ca3af' }),
    };

    const isDarkMode =
        typeof window !== 'undefined' &&
        document.documentElement.classList.contains('dark');

    const getStyles = () => {
        if (isMobile) return isDarkMode ? mobileDarkStyles : mobileStyles;
        return isDarkMode ? darkModeStyles : customStyles;
    };

    return (
        <div>
            <Label htmlFor={id || name}>
                {label} {required && <span className="text-red-500">*</span>}
            </Label>

            <AsyncSelect<Option, false>
                inputId={id || name}
                name={name}
                value={currentValue}
                onChange={handleChange}
                onBlur={handleBlur}
                loadOptions={debouncedLoadOptions}
                defaultOptions={defaultOptions}
                placeholder={placeholder}
                isDisabled={disabled}
                isClearable={isClearable}
                cacheOptions
                styles={getStyles()}
                classNamePrefix="react-select"
                noOptionsMessage={noOptionsMessage}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            />

            {meta.touched && meta.error ? (
                <HelperText valid={false}>{meta.error}</HelperText>
            ) : null}
        </div>
    );
};

export default FormAsyncSearchSelect;
