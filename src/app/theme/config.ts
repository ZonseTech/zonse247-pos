export default {
    // Alert
    alert: {
        base: 'p-2.5 rounded-md leading-5 flex items-center',
        withClose: 'pr-12',
        success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
        danger: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
        warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
        neutral: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
        info: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
        icon: {
            base: 'h-5 w-5',
            success: 'text-emerald-500 dark:text-emerald-400',
            danger: 'text-red-500 dark:text-red-400',
            warning: 'text-amber-500 dark:text-amber-400',
            neutral: 'text-zinc-500 dark:text-zinc-400',
            info: 'text-blue-600 dark:text-blue-400',
        },
    },
    // Pagination
    pagination: {
        base: 'flex flex-col justify-between text-xs sm:flex-row text-zinc-500 dark:text-zinc-400',
    },
    // TableFooter
    tableFooter: {
        base: 'px-4 py-3 border-t bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400',
    },
    // TableRow
    tableRow: {
        base: 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40',
    },
    // TableHeader
    tableHeader: {
        base: 'text-xs font-semibold tracking-wide text-left text-zinc-500 uppercase border-b bg-zinc-50 dark:text-zinc-400 dark:bg-zinc-900 dark:border-zinc-700',
    },
    // TableContainer
    tableContainer: {
        base: 'w-full overflow-hidden rounded-sm ring-1 ring-zinc-200 dark:ring-zinc-700',
    },
    // TableCell
    tableCell: {
        base: 'px-4 py-3 text-zinc-800 dark:text-zinc-200',
    },
    // TableBody
    tableBody: {
        base: 'bg-white dark:bg-zinc-900 divide-y divide-zinc-100 text-zinc-700 dark:divide-zinc-800 dark:text-zinc-300',
    },
    // DropdownItem
    dropdownItem: {
        base: 'mb-2 last:mb-0',
    },
    // Dropdown
    dropdown: {
        base: 'absolute w-56 p-2 mt-2 text-zinc-600 bg-white dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-sm shadow-md min-w-max-content shadow-lg dark:shadow-zinc-900/20',
        align: {
            left: 'left-0',
            right: 'right-0',
        },
    },
    // Avatar
    avatar: {
        base: 'relative rounded-full inline-block ring-2 ring-white dark:ring-zinc-900',
        size: {
            large: 'w-24 h-24',
            regular: 'w-8 h-8',
            small: 'w-6 h-6',
        },
    },
    // Modal
    modal: {
        base: 'w-full px-6 py-4 overflow-hidden bg-white dark:bg-zinc-800 rounded-t-lg sm:rounded-sm sm:m-4 sm:max-w-xl z-[1001] border border-zinc-200 dark:border-zinc-700',
    },
    // ModalBody
    modalBody: {
        base: 'mb-6 text-sm text-zinc-600 dark:text-zinc-300',
    },
    // ModalFooter
    modalFooter: {
        base: 'flex flex-col items-center justify-end px-6 pt-3 -mx-6 -mb-4 space-y-4 sm:space-y-0 sm:space-x-6 sm:flex-row bg-zinc-50 dark:bg-zinc-900/50',
    },
    // ModalHeader
    modalHeader: {
        base: 'my-2 text-lg font-semibold text-zinc-800 dark:text-zinc-100',
    },
    // Badge
    badge: {
        base: 'inline-flex px-2 text-xs font-medium leading-5 rounded-full',
        success: 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950',
        danger: 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950',
        warning: 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950',
        neutral: 'text-zinc-600 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-800',
        primary: 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950',
    },
    // Backdrop
    backdrop: {
        base: 'fixed inset-0 z-[1001] flex items-end bg-black bg-opacity-40 dark:bg-black dark:bg-opacity-60 sm:items-center sm:justify-center',
    },
    // Textarea
    textarea: {
        base: 'block w-full text-sm rounded-md focus:outline-none bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500',
        active: 'focus:border-blue-500 dark:focus:border-blue-600 border-zinc-300 dark:border-zinc-600 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-900',
        disabled: 'cursor-not-allowed opacity-50 bg-zinc-100 dark:bg-zinc-700',
        valid: 'border-emerald-500 dark:border-emerald-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 dark:focus:ring-emerald-900',
        invalid: 'border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 focus:ring-1 focus:ring-red-200 dark:focus:ring-red-900',
    },
    // Select
    select: {
        base: 'block w-full px-3 py-2 md:p-3 text-sm focus:outline-none rounded-md md:rounded-sm bg-gray-100 md:bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border-0 md:border md:border-zinc-300 md:dark:border-zinc-600',
        active: 'focus:ring-0 md:focus:ring-1 md:focus:ring-blue-200 md:dark:focus:ring-blue-900 md:focus:border-blue-500 md:dark:focus:border-blue-600',
        select: 'leading-5',
        disabled: 'cursor-not-allowed opacity-50 bg-zinc-200 dark:bg-zinc-700',
        valid: 'border-emerald-500 dark:border-emerald-500 focus:ring-0 md:focus:ring-1 md:focus:ring-emerald-200 md:dark:focus:ring-emerald-900 md:focus:border-emerald-500',
        invalid: 'border-red-500 dark:border-red-500 focus:ring-0 md:focus:ring-1 md:focus:ring-red-200 md:dark:focus:ring-red-900 md:focus:border-red-500',
    },
    // Label
    label: {
        base: 'block text-sm text-zinc-600 dark:text-zinc-300',
        check: 'inline-flex items-center',
        disabled: 'opacity-50 cursor-not-allowed',
    },
    // Input
    input: {
        base: 'block w-full px-3 py-2 md:p-3 text-sm focus:outline-none text-zinc-800 dark:text-zinc-100 leading-5 rounded-sm md:rounded-sm bg-gray-100 md:bg-white dark:bg-zinc-800 placeholder-zinc-400 dark:placeholder-zinc-500 border-0 md:border md:border-zinc-300 md:dark:border-zinc-600',
        active: 'focus:ring-0 md:focus:ring-1 md:focus:ring-blue-200 md:dark:focus:ring-blue-900 md:focus:border-blue-500 md:dark:focus:border-blue-600',
        disabled: 'cursor-not-allowed opacity-50 bg-zinc-200 dark:bg-zinc-700',
        valid: 'border-emerald-500 dark:border-emerald-500 focus:ring-0 md:focus:ring-1 md:focus:ring-emerald-200 md:dark:focus:ring-emerald-900 md:focus:border-emerald-500',
        invalid: 'border-red-500 dark:border-red-500 focus:ring-0 md:focus:ring-1 md:focus:ring-red-200 md:dark:focus:ring-red-900 md:focus:border-red-500',
        radio: 'text-blue-600 dark:text-blue-500 form-radio focus:outline-none focus:ring-0 md:focus:ring-1 md:focus:ring-blue-200 md:dark:focus:ring-blue-900 focus:ring-offset-0 bg-zinc-100 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600',
        checkbox: 'text-blue-600 dark:text-blue-500 form-checkbox focus:outline-none focus:ring-0 md:focus:ring-1 md:focus:ring-blue-200 md:dark:focus:ring-blue-900 focus:ring-offset-0 rounded bg-zinc-100 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600',
    },
    // HelperText
    helperText: {
        base: 'text-xs',
        valid: 'text-emerald-500 dark:text-emerald-400',
        invalid: 'text-red-500 dark:text-red-400',
    },
    // Card
    card: {
        base: 'min-w-0 rounded-sm ring-1 ring-zinc-200 dark:ring-zinc-700 overflow-hidden',
        default: 'bg-white dark:bg-zinc-900',
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
            success: 'text-white bg-emerald-500 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-500',
            danger: 'text-white bg-red-500 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-500',
            warning: 'text-white bg-amber-500 dark:bg-amber-700 hover:bg-amber-700 dark:hover:bg-amber-500',
            neutral: 'text-zinc-800 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 active:bg-zinc-300 dark:active:bg-zinc-500',
            primary: 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600',
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
            base: 'text-white dark:text-zinc-100 border border-transparent',
            active: 'active:bg-blue-700 dark:active:bg-blue-800 focus:ring-1 focus:ring-blue-300 dark:focus:ring-blue-900',
            disabled: 'cursor-not-allowed bg-blue-300 dark:bg-blue-900 text-white',
        },
        outline: {
            base: 'text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-600 border focus:outline-none bg-transparent',
            active: 'active:bg-transparent hover:border-zinc-400 dark:hover:border-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-500 active:text-zinc-500 dark:active:text-zinc-300 focus:ring-1 focus:ring-zinc-200 dark:focus:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/40',
            disabled: 'cursor-not-allowed text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700',
        },
        link: {
            base: 'text-gray-600 dark:text-gray-400 focus:outline-none border border-transparent',
            active: 'active:bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700 hover:text-gray-800 dark:hover:text-gray-200',
            disabled: 'opacity-50 cursor-not-allowed',
        },
        // this is the button that lives inside the DropdownItem
        dropdownItem: {
            base: 'inline-flex items-center cursor-pointer w-full px-2 py-1 text-sm font-medium transition-colors duration-150 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200 text-zinc-600 dark:text-zinc-300',
        },
    },
};