import { FunctionComponent, ReactNode } from 'react';
import { Card, Flex, Grid, Skeleton, Text } from '@radix-ui/themes';
import {
    FileText,
    Clock,
    Loader2,
    CheckCircle,
    XCircle,
    Ban
} from 'lucide-react';

export interface PrintJobSummaryCard {
    title: string;
    value: number;
    icon: ReactNode;
    color: string;
    bgColor: string;
}

interface PrintJobSummaryCardsProps {
    cards: PrintJobSummaryCard[];
    isLoading?: boolean;
}

const PrintJobSummaryCards: FunctionComponent<PrintJobSummaryCardsProps> = ({
    cards,
    isLoading = false
}) => {
    if (isLoading) {
        return (
            <Grid columns={{ initial: '2', sm: '3', lg: '6' }} gap="3" p="4" className="border-b border-gray-200 dark:border-gray-700">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} size="1" className="bg-gray-50 dark:bg-gray-700/50">
                        <Flex align="center" gap="2" mb="2">
                            <Skeleton width="32px" height="32px" />
                            <Skeleton width="56px" height="16px" />
                        </Flex>
                        <Skeleton width="32px" height="24px" />
                    </Card>
                ))}
            </Grid>
        );
    }

    return (
        <Grid columns={{ initial: '2', sm: '3', lg: '6' }} gap="3" p="4" className="border-b border-gray-200 dark:border-gray-700">
            {cards.map((card, index) => (
                <Card
                    key={index}
                    size="1"
                    className={`${card.bgColor} transition-all hover:scale-[1.02]`}
                >
                    <Flex align="center" gap="2" mb="1">
                        <Flex align="center" justify="center" className={`p-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 ${card.color}`}>
                            {card.icon}
                        </Flex>
                        <Text size="1" weight="medium" color="gray" truncate>
                            {card.title}
                        </Text>
                    </Flex>
                    <Text size="5" weight="bold" className={card.color}>
                        {card.value}
                    </Text>
                </Card>
            ))}
        </Grid>
    );
};

export const getDefaultPrintJobSummaryCards = (
    total: number,
    pending: number,
    printing: number,
    completed: number,
    failed: number,
    cancelled: number
): PrintJobSummaryCard[] => [
        {
            title: 'Total',
            value: total,
            icon: <FileText className="w-4 h-4" />,
            color: 'text-sky-500 dark:text-sky-400',
            bgColor: 'bg-sky-50 dark:bg-sky-900/20'
        },
        {
            title: 'Pending',
            value: pending,
            icon: <Clock className="w-4 h-4" />,
            color: 'text-yellow-600 dark:text-yellow-400',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
        },
        {
            title: 'Printing',
            value: printing,
            icon: <Loader2 className="w-4 h-4" />,
            color: 'text-sky-500 dark:text-sky-400',
            bgColor: 'bg-sky-50 dark:bg-sky-900/20'
        },
        {
            title: 'Completed',
            value: completed,
            icon: <CheckCircle className="w-4 h-4" />,
            color: 'text-green-500 dark:text-green-400',
            bgColor: 'bg-green-50 dark:bg-green-900/20'
        },
        {
            title: 'Failed',
            value: failed,
            icon: <XCircle className="w-4 h-4" />,
            color: 'text-red-500 dark:text-red-400',
            bgColor: 'bg-red-50 dark:bg-red-900/20'
        },
        {
            title: 'Cancelled',
            value: cancelled,
            icon: <Ban className="w-4 h-4" />,
            color: 'text-gray-600 dark:text-gray-400',
            bgColor: 'bg-gray-100 dark:bg-gray-700/50'
        }
    ];

export default PrintJobSummaryCards;
