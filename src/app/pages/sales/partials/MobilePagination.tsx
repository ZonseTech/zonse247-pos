import { FunctionComponent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Flex, Text, IconButton } from '@radix-ui/themes';

interface MobilePaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
}

const MobilePagination: FunctionComponent<MobilePaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
}) => {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <Flex align="center" justify="between" py="3" px="3">
            <Text size="1" color="gray">
                <Text weight="medium">{startItem}–{endItem}</Text> of {totalItems}
            </Text>
            <Flex align="center" gap="2">
                <IconButton
                    variant="outline"
                    size="3"
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-5 h-5" />
                </IconButton>
                <Text size="1" weight="medium" className="min-w-[48px] text-center tabular-nums">
                    {currentPage} / {totalPages}
                </Text>
                <IconButton
                    variant="outline"
                    size="3"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                >
                    <ChevronRight className="w-5 h-5" />
                </IconButton>
            </Flex>
        </Flex>
    );
};

export default MobilePagination;
