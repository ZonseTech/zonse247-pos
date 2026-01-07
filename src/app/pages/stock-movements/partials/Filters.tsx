import { FunctionComponent } from 'react';
import { Select, DateRangeFilter } from '../../../components';

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
        { value: 'STOCK_TAKE', label: 'Stock Take' },
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
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Start Date"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="End Date"
                />
            </div>
        </div>
    );
};

export default Filters;
