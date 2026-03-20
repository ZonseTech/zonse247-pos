import { FunctionComponent } from 'react';
import { Select } from '../../../components';
import DatePicker from 'react-datepicker';
import dayjs from 'dayjs';

interface FiltersProps {
    movementTypeFilter: StockMovementType | '';
    onMovementTypeChange: (value: StockMovementType | '') => void;
    startDate: string;
    onStartDateChange: (value: string) => void;
    endDate: string;
    onEndDateChange: (value: string) => void;
}

const Filters: FunctionComponent<FiltersProps> = ({
    movementTypeFilter,
    onMovementTypeChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
}) => {
    const movementTypes: { value: StockMovementType | ''; label: string }[] = [
        { value: '', label: 'All Types' },
        { value: 'PURCHASE_RECEIPT', label: 'Purchase Receipt' },
        { value: 'SALE', label: 'Sale' },
        { value: 'RETURN', label: 'Return' },
        { value: 'ADJUSTMENT', label: 'Adjustment' },
        { value: 'TRANSFER_IN', label: 'Transfer In' },
        { value: 'TRANSFER_OUT', label: 'Transfer Out' },
        { value: 'DAMAGE', label: 'Damage' },
        { value: 'EXPIRY', label: 'Expiry' },
        { value: 'OPENING_BALANCE', label: 'Opening Balance' },
        { value: 'RETURN_TO_SUPPLIER', label: 'Return to Supplier' },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-4">
            <Select
                value={movementTypeFilter}
                onChange={(e) => onMovementTypeChange(e.target.value as StockMovementType | '')}
                className="md:w-64"
            >
                {movementTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                        {type.label}
                    </option>
                ))}
            </Select>

            <div className="flex gap-2">
                <DatePicker
                    selected={startDate ? new Date(startDate) : null}
                    onChange={((date: Date | null) => onStartDateChange(date ? dayjs(date).format('YYYY-MM-DD') : '')) as any}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Start Date"
                    isClearable
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    portalId="datepicker-portal"
                />
                <DatePicker
                    selected={endDate ? new Date(endDate) : null}
                    onChange={((date: Date | null) => onEndDateChange(date ? dayjs(date).format('YYYY-MM-DD') : '')) as any}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="End Date"
                    isClearable
                    minDate={startDate ? new Date(startDate) : undefined}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    portalId="datepicker-portal"
                />
            </div>
        </div>
    );
};

export default Filters;
