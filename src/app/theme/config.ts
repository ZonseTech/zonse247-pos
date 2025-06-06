export default {
    // Alert
    alert: {
        base: 'p-2.5 rounded-md leading-5 flex items-center',
        withClose: 'pr-12',
        success: 'bg-green-100 text-red-700',
        danger: 'bg-red-100 text-red-700',
        warning: 'bg-yellow-100 text-red-700',
        neutral: 'bg-gray-100 text-gray-300',
        info: 'bg-blue-100 text-red-700',
        icon: {
            base: 'h-5 w-5',
            success: 'text-green-700',
            danger: 'text-red-700',
            warning: 'text-yellow-100',
            neutral: 'text-gray-500',
            info: 'text-blue-700',
        },
    },
    // Pagination
    pagination: {
        base: 'flex flex-col justify-between text-xs sm:flex-row text-gray-600',
    },
    // TableFooter
    tableFooter: {
        base: 'px-4 py-3 border-t bg-gray-50 text-gray-500',
    },
    // TableRow
    tableRow: {
        base: '',
    },
    // TableHeader
    tableHeader: {
        base: 'text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b bg-gray-50',
    },
    // TableContainer
    tableContainer: {
        base: 'w-full overflow-hidden rounded-sm ring-1 ring-black ring-opacity-5',
    },
    // TableCell
    tableCell: {
        base: 'px-4 py-3',
    },
    // TableBody
    tableBody: {
        base: 'bg-white divide-y text-gray-700',
    },
    // DropdownItem
    // this is the <li> that lives inside the Dropdown <ul>
    // you're probably looking for the dropdownItem style inside button
    dropdownItem: {
        base: 'mb-2 last:mb-0',
    },
    // Dropdown
    dropdown: {
        base: 'absolute w-56 p-2 mt-2 text-gray-600 bg-white border border-gray-100 rounded-sm shadow-md min-w-max-content',
        align: {
            left: 'left-0',
            right: 'right-0',
        },
    },
    // Avatar
    avatar: {
        base: 'relative rounded-full inline-block',
        size: {
            large: 'w-24 h-24',
            regular: 'w-8 h-8',
            small: 'w-6 h-6',
        },
    },
    // Modal
    modal: {
        base: 'w-full px-6 py-4 overflow-hidden bg-white rounded-t-lg sm:rounded-sm sm:m-4 sm:max-w-xl z-[1001]',
    },
    // ModalBody
    modalBody: {
        base: 'mb-6 text-sm text-gray-700',
    },
    // ModalFooter
    modalFooter: {
        base: 'flex flex-col items-center justify-end px-6 pt-3 -mx-6 -mb-4 space-y-4 sm:space-y-0 sm:space-x-6 sm:flex-row bg-gray-50',
    },
    // ModalHeader
    modalHeader: {
        base: 'my-2 text-lg font-semibold text-gray-700',
    },
    // Badge
    badge: {
        base: 'inline-flex px-2 text-xs font-medium leading-5 rounded-full',
        success: 'text-green-700 bg-green-100',
        danger: 'text-red-700 bg-red-100',
        warning: 'text-orange-700 bg-orange-100',
        neutral: 'text-gray-700 bg-gray-100',
        primary: 'text-blue-700 bg-blue-100',
    },
    // Backdrop
    backdrop: {
        base: 'fixed inset-0 z-[1001] flex items-end bg-black bg-opacity-50 sm:items-center sm:justify-center',
    },
    // Textarea
    textarea: {
        base: 'block w-full text-sm rounded-md focus:outline-none',
        active:
            'focus:border-gray-400 border-gray-300 focus:ring-1 focus:ring-gray-200',
        disabled: 'cursor-not-allowed opacity-50 bg-gray-200',
        valid: 'border-green-600 focus:border-green-400 focus:ring-1 focus:ring-green-200',
        invalid:
            'border-red-600 focus:border-red-400 focus:ring-1 focus:ring-red-200',
    },
    // Select
    select: {
        base: 'block w-full text-sm focus:outline-none rounded-sm',
        active:
            'focus:border-blue-400 border-gray-300 focus:ring-1 focus:ring-blue-300',
        select: 'leading-5',
        disabled: 'cursor-not-allowed opacity-50 bg-gray-300',
        valid: 'border-green-600 focus:border-green-400 focus:ring-1 focus:ring-green-200',
        invalid:
            'border-red-600 focus:border-red-400 focus:ring-1 focus:ring-red-200',
    },
    // Label
    label: {
        base: 'block text-sm text-gray-700',
        // check and radio get this same style
        check: 'inline-flex items-center',
        disabled: 'opacity-50 cursor-not-allowed',
    },
    // Input
    input: {
        base: 'block w-full p-3 text-sm focus:outline-none text-gray-800 leading-5 rounded-sm text-black',
        active:
            'focus:border-gray-400 border-gray-300 focus:ring-1 focus:ring-gray-300',
        disabled: 'cursor-not-allowed opacity-50 bg-gray-300',
        valid: 'border-green-600 focus:border-green-400 focus:ring-1 focus:ring-green-200',
        invalid:
            'border-red-600 focus:border-red-400 focus:ring-1 focus:ring-red-200',
        radio: 'text-gray-600 form-radio focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:ring-offset-0',
        checkbox:
            'text-gray-600 form-checkbox focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:ring-offset-0 rounded',
    },
    // HelperText
    helperText: {
        base: 'text-xs',
        valid: 'text-green-600',
        invalid: 'text-red-600',
    },
    // Card
    card: {
        base: 'min-w-0 rounded-sm ring-1 ring-black ring-opacity-5 overflow-hidden',
        default: 'bg-white',
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
            success: 'text-green-700 bg-green-600',
            danger: 'text-red-700 bg-red-600',
            warning: 'text-orange-700 bg-orange-600',
            neutral: 'text-gray-700 bg-[#ededed]',
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
            base: 'text-white bg-blue-600 border border-transparent',
            active:
                'active:bg-blue-600 hover:bg-blue-700 focus:ring-1 focus:ring-blue-300',
            disabled: 'opacity-50 cursor-not-allowed',
        },
        outline: {
            base: 'text-gray-600 border-gray-300 border focus:outline-none',
            active:
                'active:bg-transparent hover:border-gray-500 focus:border-gray-500 active:text-gray-500 focus:ring-1 focus:ring-gray-300',
            disabled: 'opacity-50 cursor-not-allowed bg-gray-300',
        },
        link: {
            base: 'text-gray-600 focus:outline-none border border-transparent',
            active:
                'active:bg-transparent hover:bg-gray-100 focus:ring-1 focus:ring-gray-300 dark:hover:bg-gray-500 dark:hover:text-gray-300 dark:hover:bg-opacity-10',
            disabled: 'opacity-50 cursor-not-allowed',
        },
        // this is the button that lives inside the DropdownItem
        dropdownItem: {
            base: 'inline-flex items-center cursor-pointer w-full px-2 py-1 text-sm font-medium transition-colors duration-150 rounded-md hover:bg-gray-100 hover:text-gray-800',
        },
    },
};
