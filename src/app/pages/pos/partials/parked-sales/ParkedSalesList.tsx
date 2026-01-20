import { FunctionComponent } from 'react';
import ParkedSaleCard from './ParkedSaleCard';

interface ParkedSalesListProps {
    sales: ParkedSale[];
    selectedSaleId: string | null;
    isLoading: boolean;
    onViewDetails: (sale: ParkedSale) => void;
    onResume: (sale: ParkedSale) => void;
    onDelete: (sale: ParkedSale) => void;
}

const ParkedSalesList: FunctionComponent<ParkedSalesListProps> = ({
    sales,
    selectedSaleId,
    isLoading,
    onViewDetails,
    onResume,
    onDelete,
}) => {
    return (
        <div className="max-h-[60vh] overflow-y-auto">
            <div className="space-y-3">
                {sales.map((sale) => (
                    <ParkedSaleCard
                        key={sale.id}
                        sale={sale}
                        isSelected={selectedSaleId === sale.id}
                        isLoading={isLoading}
                        onViewDetails={onViewDetails}
                        onResume={onResume}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
};

export default ParkedSalesList;
