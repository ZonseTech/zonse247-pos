import Select from 'react-select'
import AddCustomerModal from './AddCustomerModal';
import { useProducts } from '../../context/ProductsProvider';
import { Fragment, FunctionComponent, useContext, useEffect, useState } from 'react'
import { ZonseThemeContext } from '../../components';

const CustomerFilter: FunctionComponent = () => {
    const { mode } = useContext(ZonseThemeContext);
    const [customer, setCustomer] = useState<string>("");
    const { customers, fetchCustomers, setSelectedCustomer } = useProducts();

    useEffect(() => {
        const arr = customers.filter((c) => c.uuid === customer.toString())
        if (arr.length > 0) setSelectedCustomer(arr[0]);
    }, [customer]);

    useEffect(() => {
        if (customers.length) setCustomer(customers[0].uuid)
    }, [customers])

    const handleSelectedCustomer = async (cus: Customer) => {
        await fetchCustomers();
        setTimeout(() => {
            setCustomer(cus.uuid);
        }, 200);
    }

    const options = [
        ...customers.map((c) => ({
            value: c.uuid,
            label: c.name
        }))
    ];

    const isDarkMode = mode === 'dark'

    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', // gray-800 : white
            borderColor: isDarkMode ? '#4b5563' : '#d1d5db', // gray-600 : gray-300
            borderRadius: '0.375rem 0 0 0.375rem', // rounded-l-md
            borderRightWidth: '0',
            minHeight: '44px',
            boxShadow: state.isFocused
                ? isDarkMode
                    ? '0 0 0 2px #10b981' // emerald-500
                    : '0 0 0 2px #10b981'
                : 'none',
            borderWidth: '1px',
            '&:hover': {
                borderColor: isDarkMode ? '#6b7280' : '#9ca3af', // gray-500 : gray-400
            },
            transition: 'all 0.2s ease-in-out',
        }),
        menu: (provided: any) => ({
            ...provided,
            backgroundColor: isDarkMode ? '#111827' : '#ffffff', // gray-900 : white
            border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb', // gray-700 : gray-200
            borderRadius: '0.5rem',
            boxShadow: isDarkMode
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
                : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 50,
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? isDarkMode ? '#065f46' : '#10b981' // emerald-800 : emerald-500
                : state.isFocused
                    ? isDarkMode ? '#1f2937' : '#f3f4f6' // gray-800 : gray-100
                    : 'transparent',
            color: state.isSelected
                ? '#ffffff'
                : isDarkMode ? '#f9fafb' : '#111827', // gray-50 : gray-900
            cursor: 'pointer',
            padding: '8px 12px',
            '&:hover': {
                backgroundColor: state.isSelected
                    ? isDarkMode ? '#065f46' : '#10b981'
                    : isDarkMode ? '#374151' : '#e5e7eb', // gray-700 : gray-200
            },
            transition: 'all 0.15s ease-in-out',
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: isDarkMode ? '#f9fafb' : '#111827', // gray-50 : gray-900
        }),
        input: (provided: any) => ({
            ...provided,
            color: isDarkMode ? '#f9fafb' : '#111827', // gray-50 : gray-900
        }),
        placeholder: (provided: any) => ({
            ...provided,
            color: isDarkMode ? '#9ca3af' : '#6b7280', // gray-400 : gray-500
        }),
        indicatorSeparator: (provided: any) => ({
            ...provided,
            backgroundColor: isDarkMode ? '#4b5563' : '#d1d5db', // gray-600 : gray-300
        }),
        dropdownIndicator: (provided: any) => ({
            ...provided,
            color: isDarkMode ? '#9ca3af' : '#6b7280', // gray-400 : gray-500
            '&:hover': {
                color: isDarkMode ? '#f3f4f6' : '#374151', // gray-100 : gray-700
            },
        }),
        clearIndicator: (provided: any) => ({
            ...provided,
            color: isDarkMode ? '#9ca3af' : '#6b7280', // gray-400 : gray-500
            '&:hover': {
                color: isDarkMode ? '#f87171' : '#ef4444', // red-400 : red-500
            },
        }),
        noOptionsMessage: (provided: any) => ({
            ...provided,
            color: isDarkMode ? '#9ca3af' : '#6b7280', // gray-400 : gray-500
        }),
        loadingMessage: (provided: any) => ({
            ...provided,
            color: isDarkMode ? '#9ca3af' : '#6b7280', // gray-400 : gray-500
        }),
    };

    return (
        <Fragment>
            <div className="flex mb-4 px-2.5 pt-2.5">
                <Select
                    value={options.find(opt => opt.value.toString() === customer.toString())}
                    onChange={(selectedOption) => {
                        if (selectedOption) {
                            setCustomer(selectedOption.value);
                        }
                    }}
                    isSearchable
                    options={options}
                    styles={customStyles}
                    className="flex-grow"
                    classNamePrefix="react-select"
                    placeholder="Select a customer..."
                    noOptionsMessage={() => "No customers found"}
                    theme={(theme) => ({
                        ...theme,
                        colors: {
                            ...theme.colors,
                            primary: '#10b981', // emerald-500
                            primary75: '#34d399', // emerald-400
                            primary50: '#6ee7b7', // emerald-300
                            primary25: '#a7f3d0', // emerald-200
                        },
                    })}
                />
                <AddCustomerModal handleSelectedCustomer={handleSelectedCustomer} />
            </div>
        </Fragment>
    )
}

export default CustomerFilter