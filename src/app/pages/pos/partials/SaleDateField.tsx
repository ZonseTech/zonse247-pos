import { FunctionComponent } from 'react';
import { Calendar } from 'lucide-react';
import dayjs from 'dayjs';
import DatePicker from 'react-datepicker';

interface SaleDateFieldProps {
    /** ISO date string (YYYY-MM-DD), or null to use today */
    value: string | null;
    onChange: (date: string | null) => void;
    /** Renders as a small inline trigger button (e.g. next to the customer picker) instead of a full labeled field */
    compact?: boolean;
}

const SaleDateField: FunctionComponent<SaleDateFieldProps> = ({ value, onChange, compact = false }) => {
    const handleChange = (date: Date | null) => onChange(date ? dayjs(date).format('YYYY-MM-DD') : null);

    if (compact) {
        return (
            <DatePicker
                selected={value ? new Date(value) : new Date()}
                onChange={handleChange}
                dateFormat="yyyy-MM-dd"
                maxDate={new Date()}
                withPortal
                portalId="datepicker-portal"
                customInput={
                    <button
                        type="button"
                        className={`inline-flex items-center gap-1.5 font-medium transition-all underline decoration-2 underline-offset-4 hover:decoration-1 text-xs ${value
                            ? 'text-amber-700 dark:text-amber-300 decoration-amber-400 hover:text-amber-800 dark:hover:text-amber-200'
                            : 'text-gray-500 dark:text-gray-400 decoration-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                        title="Set sale date (backdate this sale)"
                    >
                        <Calendar className="w-3 h-3" />
                        <span>{value ? dayjs(value).format('DD MMM YYYY') : 'Sale Date'}</span>
                    </button>
                }
            />
        );
    }

    return (
        <div className="mb-4">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                Sale Date
            </label>
            <DatePicker
                selected={value ? new Date(value) : new Date()}
                onChange={handleChange}
                dateFormat="yyyy-MM-dd"
                maxDate={new Date()}
                withPortal
                portalId="datepicker-portal"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                Backdate this sale to record a past transaction.
            </p>
        </div>
    );
};

export default SaleDateField;
