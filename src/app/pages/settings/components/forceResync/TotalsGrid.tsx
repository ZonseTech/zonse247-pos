import { FunctionComponent } from 'react';
import { Card, Flex, Grid, Text } from '@radix-ui/themes';

interface TotalsGridProps {
    progress: ForceResyncProgress;
}

const STATS: Array<{
    key: keyof Pick<
        ForceResyncProgress,
        'totalProcessed' | 'totalAccepted' | 'totalRejected' | 'totalDeferred'
    >;
    label: string;
    color?: 'gray' | 'green' | 'red' | 'amber';
}> = [
        { key: 'totalProcessed', label: 'Processed' },
        { key: 'totalAccepted', label: 'Accepted', color: 'green' },
        { key: 'totalRejected', label: 'Rejected', color: 'red' },
        { key: 'totalDeferred', label: 'Deferred', color: 'amber' },
    ];

const TotalsGrid: FunctionComponent<TotalsGridProps> = ({ progress }) => (
    <Grid columns="4" gap="2" width="100%">
        {STATS.map((s) => (
            <Card key={s.key} size="1" variant="surface">
                <Flex direction="column" gap="1">
                    <Text size="1" color="gray" as="div">
                        {s.label}
                    </Text>
                    <Text
                        size="4"
                        weight="bold"
                        color={s.color}
                        className="tabular-nums"
                        as="div"
                    >
                        {progress[s.key].toLocaleString()}
                    </Text>
                </Flex>
            </Card>
        ))}
    </Grid>
);

export default TotalsGrid;
