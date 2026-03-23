import { FunctionComponent, useCallback } from 'react';
import { Flex, Select } from '@radix-ui/themes';
import MobileDateFilter from '../../../components/reports/MobileDateFilter';
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
        { value: '', label: 'All Stock Types' },
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

    const handleDateChange = useCallback((start: Date | null, end: Date | null) => {
        onStartDateChange(start ? dayjs(start).format('YYYY-MM-DD') : '');
        onEndDateChange(end ? dayjs(end).format('YYYY-MM-DD') : '');
    }, [onStartDateChange, onEndDateChange]);

    return (
        <Flex direction={{ initial: 'column', md: 'row' }} gap="4" align="center">
            <Select.Root
                value={movementTypeFilter || '__all__'}
                onValueChange={(val) => onMovementTypeChange(val === '__all__' ? '' : val as StockMovementType)}
                size="2"
            >
                <Select.Trigger placeholder="All Types" className="md:min-w-[16rem]" />
                <Select.Content>
                    {movementTypes.map((type) => (
                        <Select.Item key={type.value} value={type.value || '__all__'}>
                            {type.label}
                        </Select.Item>
                    ))}
                </Select.Content>
            </Select.Root>

            <MobileDateFilter
                startDate={startDate ? new Date(startDate) : null}
                endDate={endDate ? new Date(endDate) : null}
                onChange={handleDateChange}
            />
        </Flex>
    );
};

export default Filters;
