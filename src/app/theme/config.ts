export default {
    // Alert
    alert: {
        base: 'p-2.5 rounded-md leading-5 flex items-center',
        withClose: 'pr-12',
        success: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        danger: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
        warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
        neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        icon: {
            base: 'h-5 w-5',
            success: 'text-green-700 dark:text-green-400',
            danger: 'text-red-700 dark:text-red-400',
            warning: 'text-yellow-700 dark:text-yellow-400',
            neutral: 'text-gray-500 dark:text-gray-400',
            info: 'text-blue-700 dark:text-blue-400',
        },
    },
    // Pagination
    pagination: {
        base: 'flex flex-col justify-between text-xs sm:flex-row text-gray-600 dark:text-gray-400',
    },
    // TableFooter
    tableFooter: {
        base: 'px-4 py-3 border-t bg-gray-50 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400',
    },
    // TableRow
    tableRow: {
        base: 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
    },
    // TableHeader
    tableHeader: {
        base: 'text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b bg-gray-50 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700',
    },
    // TableContainer
    tableContainer: {
        base: 'w-full overflow-hidden rounded-sm ring-1 ring-black ring-opacity-5 dark:ring-gray-700',
    },
    // TableCell
    tableCell: {
        base: 'px-4 py-3 text-gray-900 dark:text-gray-100',
    },
    // TableBody
    tableBody: {
        base: 'bg-white dark:bg-gray-900 divide-y divide-gray-200 text-gray-700 dark:divide-gray-700 dark:text-gray-300',
    },
    // DropdownItem
    dropdownItem: {
        base: 'mb-2 last:mb-0',
    },
    // Dropdown
    dropdown: {
        base: 'absolute w-56 p-2 mt-2 text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-100 dark:border-gray-700 rounded-sm shadow-md min-w-max-content shadow-lg dark:shadow-gray-900/20',
        align: {
            left: 'left-0',
            right: 'right-0',
        },
    },
    // Avatar
    avatar: {
        base: 'relative rounded-full inline-block ring-2 ring-white dark:ring-gray-800',
        size: {
            large: 'w-24 h-24',
            regular: 'w-8 h-8',
            small: 'w-6 h-6',
        },
    },
    // Modal
    modal: {
        base: 'w-full px-6 py-4 overflow-hidden bg-white dark:bg-gray-800 rounded-t-lg sm:rounded-sm sm:m-4 sm:max-w-xl z-[1001] border dark:border-gray-700',
    },
    // ModalBody
    modalBody: {
        base: 'mb-6 text-sm text-gray-700 dark:text-gray-300',
    },
    // ModalFooter
    modalFooter: {
        base: 'flex flex-col items-center justify-end px-6 pt-3 -mx-6 -mb-4 space-y-4 sm:space-y-0 sm:space-x-6 sm:flex-row bg-gray-50 dark:bg-gray-900/50',
    },
    // ModalHeader
    modalHeader: {
        base: 'my-2 text-lg font-semibold text-gray-700 dark:text-gray-200',
    },
    // Badge
    badge: {
        base: 'inline-flex px-2 text-xs font-medium leading-5 rounded-full',
        success: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
        danger: 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
        warning: 'text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20',
        neutral: 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-700',
        primary: 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
    },
    // Backdrop
    backdrop: {
        base: 'fixed inset-0 z-[1001] flex items-end bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 sm:items-center sm:justify-center',
    },
    // Textarea
    textarea: {
        base: 'block w-full text-sm rounded-md focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400',
        active: 'focus:border-gray-400 dark:focus:border-gray-500 border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700',
        disabled: 'cursor-not-allowed opacity-50 bg-gray-200 dark:bg-gray-700',
        valid: 'border-green-600 dark:border-green-500 focus:border-green-400 dark:focus:border-green-400 focus:ring-1 focus:ring-green-200 dark:focus:ring-green-800',
        invalid: 'border-red-600 dark:border-red-500 focus:border-red-400 dark:focus:border-red-400 focus:ring-1 focus:ring-red-200 dark:focus:ring-red-800',
    },
    // Select
    select: {
        base: 'block w-full text-sm focus:outline-none rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
        active: 'focus:border-blue-400 dark:focus:border-blue-500 border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-300 dark:focus:ring-blue-800',
        select: 'leading-5',
        disabled: 'cursor-not-allowed opacity-50 bg-gray-300 dark:bg-gray-700',
        valid: 'border-green-600 dark:border-green-500 focus:border-green-400 focus:ring-1 focus:ring-green-200 dark:focus:ring-green-800',
        invalid: 'border-red-600 dark:border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-200 dark:focus:ring-red-800',
    },
    // Label
    label: {
        base: 'block text-sm text-gray-700 dark:text-gray-300',
        check: 'inline-flex items-center',
        disabled: 'opacity-50 cursor-not-allowed',
    },
    // Input
    input: {
        base: 'block w-full p-3 text-sm focus:outline-none text-gray-800 dark:text-gray-200 leading-5 rounded-sm bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400',
        active: 'focus:border-gray-400 dark:focus:border-gray-500 border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700',
        disabled: 'cursor-not-allowed opacity-50 bg-gray-300 dark:bg-gray-700',
        valid: 'border-green-600 dark:border-green-500 focus:border-green-400 focus:ring-1 focus:ring-green-200 dark:focus:ring-green-800',
        invalid: 'border-red-600 dark:border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-200 dark:focus:ring-red-800',
        radio: 'text-blue-600 dark:text-blue-500 form-radio focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700 focus:ring-offset-0 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
        checkbox: 'text-blue-600 dark:text-blue-500 form-checkbox focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700 focus:ring-offset-0 rounded bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
    },
    // HelperText
    helperText: {
        base: 'text-xs',
        valid: 'text-green-600 dark:text-green-400',
        invalid: 'text-red-600 dark:text-red-400',
    },
    // Card
    card: {
        base: 'min-w-0 rounded-sm ring-1 ring-black ring-opacity-5 dark:ring-gray-700 overflow-hidden',
        default: 'bg-white dark:bg-gray-800',
    },
    cardBody: {
        base: 'p-4',
    },
    // Button
    button: {
        base: 'align-bottom inline-flex items-center justify-center cursor-pointer leading-5 transition-colors duration-150 font-medium focus:outline-none',
        block: 'w-full',
        size: {
            larger: 'px-10 py-4 rounded-sm',
            large: 'px-5 py-3 rounded-sm',
            regular: 'px-4 py-2 rounded-sm text-sm',
            small: 'px-3 py-1 rounded-md text-sm',
            icon: {
                larger: 'p-4 rounded-sm',
                large: 'p-3 rounded-sm',
                regular: 'p-2 rounded-sm',
                small: 'p-2 rounded-md',
            },
            pagination: 'px-3 py-1 rounded-md text-xs',
        },
        theme: {
            success: 'text-white bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600',
            danger: 'text-white bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600',
            warning: 'text-white bg-orange-600 dark:bg-orange-700 hover:bg-orange-700 dark:hover:bg-orange-600',
            neutral: 'text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600',
            primary: '',
        },
        // styles applied to the SVG icon
        icon: {
            larger: 'h-5 w-5',
            large: 'h-5 w-5',
            regular: 'h-5 w-5',
            small: 'h-3 w-3',
            left: 'mr-2 -ml-1',
            right: 'ml-2 -mr-1',
        },
        primary: {
            base: 'text-white dark:text-gray-100 bg-blue-600 dark:bg-blue-700 border border-transparent',
            active: 'active:bg-blue-700 dark:active:bg-blue-800 hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-1 focus:ring-blue-300 dark:focus:ring-blue-800',
            disabled: 'opacity-50 cursor-not-allowed',
        },
        outline: {
            base: 'text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 border focus:outline-none bg-transparent',
            active: 'active:bg-transparent hover:border-gray-500 dark:hover:border-gray-400 focus:border-gray-500 dark:focus:border-gray-400 active:text-gray-500 dark:active:text-gray-300 focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50',
            disabled: 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800',
        },
        link: {
            base: 'text-gray-600 dark:text-gray-400 focus:outline-none border border-transparent',
            active: 'active:bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700 hover:text-gray-800 dark:hover:text-gray-200',
            disabled: 'opacity-50 cursor-not-allowed',
        },
        // this is the button that lives inside the DropdownItem
        dropdownItem: {
            base: 'inline-flex items-center cursor-pointer w-full px-2 py-1 text-sm font-medium transition-colors duration-150 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 text-gray-700 dark:text-gray-300',
        },
    },
};