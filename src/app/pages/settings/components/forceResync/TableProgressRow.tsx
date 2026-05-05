import { FunctionComponent } from 'react';
import { Badge, Box, Flex, Text } from '@radix-ui/themes';
import { STATUS_BADGE_COLOR, STATUS_LABEL, TABLE_LABELS } from './constants';

interface TableProgressRowProps {
    row: ForceResyncTableProgress;
}

const TableProgressRow: FunctionComponent<TableProgressRowProps> = ({ row }) => {
    const lastError = row.errors.length ? row.errors[row.errors.length - 1] : null;
    return (
        <Flex
            align="center"
            justify="between"
            gap="3"
            px="3"
            py="2"
            className="border-b border-[var(--gray-a4)] last:border-b-0"
        >
            <Box style={{ flex: 1, minWidth: 0 }}>
                <Text as="div" size="2" weight="medium">
                    {TABLE_LABELS[row.table]}
                </Text>
                {lastError && (
                    <Text
                        as="div"
                        size="1"
                        color="red"
                        truncate
                        title={lastError}
                    >
                        {lastError}
                    </Text>
                )}
            </Box>
            <Box className="text-right tabular-nums">
                <Text as="div" size="1" color="gray">
                    {row.accepted.toLocaleString()} / {row.processed.toLocaleString()}
                </Text>
                {(row.rejected > 0 || row.deferred > 0) && (
                    <Text as="div" size="1" color="gray">
                        {row.rejected > 0 ? `${row.rejected} rejected` : ''}
                        {row.rejected > 0 && row.deferred > 0 ? ' · ' : ''}
                        {row.deferred > 0 ? `${row.deferred} deferred` : ''}
                    </Text>
                )}
            </Box>
            <Badge color={STATUS_BADGE_COLOR[row.status]} variant="soft" radius="full">
                {STATUS_LABEL[row.status]}
            </Badge>
        </Flex>
    );
};

export default TableProgressRow;
