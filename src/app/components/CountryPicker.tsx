import { AnimatePresence, motion } from "framer-motion";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { SelectMenuOption } from "../../types/country";
import { COUNTRIES } from "../utils/countries";
import Input from "./Input";

export interface CountryPickerProps {
    id: string;
    open: boolean;
    disabled?: boolean;
    onToggle: () => void;
    onChange: (value: SelectMenuOption["value"]) => void;
    selectedValue: SelectMenuOption;
}

export default function CountryPicker({
    id,
    open,
    disabled = false,
    onToggle,
    onChange,
    selectedValue,
}: CountryPickerProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mutableRef = ref as MutableRefObject<HTMLDivElement | null>;

        const handleClickOutside = (event) => {
            if (
                mutableRef.current &&
                !mutableRef.current.contains(event.target) &&
                open
            ) {
                onToggle();
                setQuery("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref]);

    const [query, setQuery] = useState("");

    return (
        <div ref={ref}>
            <div className="relative">
                <label className="block text-sm text-gray-700 dark:text-gray-300" htmlFor="country-picker">
                    Country
                </label>
                <button
                    type="button"
                    className={`${disabled
                        ? "bg-neutral-100 dark:bg-neutral-800"
                        : "bg-white dark:bg-gray-800"
                        } relative w-full border border-gray-300 dark:border-gray-600 rounded-sm shadow-sm pl-3 pr-10 py-3 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 sm:text-sm text-gray-900 dark:text-gray-100`}
                    aria-haspopup="listbox"
                    aria-expanded="true"
                    aria-labelledby="listbox-label"
                    onClick={onToggle}
                    disabled={disabled}
                >
                    <span className="truncate flex items-center">
                        <img
                            alt={`${selectedValue.value}`}
                            src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${selectedValue.value}.svg`}
                            className={"inline mr-2 h-4 rounded-sm"}
                        />
                        {selectedValue.title}
                    </span>
                    <span
                        className={`absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none ${disabled ? "hidden" : ""
                            }`}
                    >
                        <svg
                            className="h-5 w-5 text-gray-400 dark:text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </span>
                </button>

                <AnimatePresence>
                    {open && (
                        <motion.ul
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                            className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-80 rounded-md text-base ring-1 ring-black dark:ring-gray-600 ring-opacity-5 dark:ring-opacity-50 focus:outline-none sm:text-sm"
                            tabIndex={-1}
                            role="listbox"
                            aria-labelledby="listbox-label"
                            aria-activedescendant="listbox-option-3"
                        >
                            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800">
                                <li className="text-gray-900 dark:text-gray-100 cursor-default select-none relative py-2 px-3">
                                    <Input
                                        type="search"
                                        name="search"
                                        autoComplete={"off"}
                                        placeholder={"Search a country"}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                </li>
                                <hr className="border-gray-200 dark:border-gray-700" />
                            </div>

                            <div
                                className={
                                    "max-h-64 scrollbar scrollbar-track-gray-100 dark:scrollbar-track-gray-700 scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 scrollbar-thumb-rounded scrollbar-thin overflow-y-scroll"
                                }
                            >
                                {COUNTRIES.filter((country) =>
                                    country.title.toLowerCase().startsWith(query.toLowerCase())
                                ).length === 0 ? (
                                    <li className="text-gray-900 dark:text-gray-300 cursor-default select-none relative py-2 pl-3 pr-9">
                                        No countries found
                                    </li>
                                ) : (
                                    COUNTRIES.filter((country) =>
                                        country.title.toLowerCase().startsWith(query.toLowerCase())
                                    ).map((value, index) => {
                                        return (
                                            <li
                                                key={`${id}-${index}`}
                                                className="text-gray-900 dark:text-gray-100 cursor-default select-none relative py-2 pl-3 pr-9 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                                id="listbox-option-0"
                                                role="option"
                                                onClick={() => {
                                                    onChange(value.value);
                                                    setQuery("");
                                                    onToggle();
                                                }}
                                            >
                                                <img
                                                    alt={`${value.value}`}
                                                    src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${value.value}.svg`}
                                                    className={"inline mr-2 h-4 rounded-sm"}
                                                />

                                                <span className="font-normal truncate">
                                                    {value.title}
                                                </span>
                                                {value.value === selectedValue.value ? (
                                                    <span className="text-blue-600 dark:text-blue-400 absolute inset-y-0 right-0 flex items-center pr-8">
                                                        <svg
                                                            className="h-5 w-5"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </span>
                                                ) : null}
                                            </li>
                                        );
                                    })
                                )}
                            </div>
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}