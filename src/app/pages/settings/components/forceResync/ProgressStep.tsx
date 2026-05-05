import { FunctionComponent } from 'react';
import {
    Box,
    Button,
    Callout,
    Card,
    Flex,
    Heading,
    Progress,
    ScrollArea,
    Spinner,
    Text,
} from '@radix-ui/themes';
import { CheckCircle2, ClipboardCopy, XCircle } from 'lucide-react';
import TableProgressRow from './TableProgressRow';
import TotalsGrid from './TotalsGrid';
import { TABLE_LABELS } from './constants';
import {
    buildSupportPayload,
    calcCompletionPercent,
    formatDuration,
} from './utils';

interface ProgressStepProps {
    progress: ForceResyncProgress;
    isRunning: boolean;
    onCancel: () => void;
    onClose: () => void;
}

const ProgressStep: FunctionComponent<ProgressStepProps> = ({
    progress,
    isRunning,
    onCancel,
    onClose,
}) => {
    const showSummary =
        progress.status === 'completed' || progress.status === 'failed';
    const percent = calcCompletionPercent(progress.tables);
    const completed = progress.tables.filter(
        (t) => t.status === 'done' || t.status === 'failed' || t.status === 'deferred'
    ).length;
    const total = progress.tables.length;

    const progressColor: 'sky' | 'green' | 'red' =
        progress.status === 'completed'
            ? 'green'
            : progress.status === 'failed'
                ? 'red'
                : 'sky';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(
                JSON.stringify(buildSupportPayload(progress), null, 2)
            );
        } catch {
            /* noop */
        }
    };

    return (
        <Flex direction="column" gap="4">
            <Flex align="center" justify="between" gap="3" wrap="wrap">
                <Flex align="center" gap="3">
                    {progress.status === 'completed' ? (
                        <CheckCircle2 className="text-[var(--green-9)]" size={22} />
                    ) : progress.status === 'failed' ? (
                        <XCircle className="text-[var(--red-9)]" size={22} />
                    ) : (
                        <Spinner size="3" />
                    )}
                    <Box>
                        <Heading as="h3" size="3" weight="medium" className="capitalize">
                            {progress.status}
                            {progress.currentTable
                                ? ` — ${TABLE_LABELS[progress.currentTable]}`
                                : ''}
                        </Heading>
                        <Text size="1" color="gray">
                            {progress.mode.toUpperCase()} ·{' '}
                            {formatDuration(progress.startedAt, progress.finishedAt)} elapsed
                        </Text>
                    </Box>
                </Flex>
                <Box className="text-right">
                    <Text size="6" weight="bold" className="tabular-nums" as="div">
                        {percent}%
                    </Text>
                    <Text size="1" color="gray" as="div">
                        {completed} / {total} tables
                    </Text>
                </Box>
            </Flex>

            <Progress
                value={percent}
                max={100}
                color={progressColor}
                size="2"
                aria-label="Force resync progress"
            />

            <TotalsGrid progress={progress} />

            <Card size="1" variant="surface">
                <ScrollArea scrollbars="vertical" style={{ maxHeight: 280 }}>
                    {progress.tables.map((row) => (
                        <TableProgressRow key={row.table} row={row} />
                    ))}
                </ScrollArea>
            </Card>

            {progress.error && (
                <Callout.Root color="red" variant="surface">
                    <Callout.Icon>
                        <XCircle size={16} />
                    </Callout.Icon>
                    <Callout.Text>{progress.error}</Callout.Text>
                </Callout.Root>
            )}

            <Flex justify="between" gap="2" mt="2" wrap="wrap">
                <Box>
                    {showSummary && (
                        <Button variant="soft" color="gray" onClick={handleCopy}>
                            <ClipboardCopy size={16} />
                            Copy details
                        </Button>
                    )}
                </Box>
                <Flex gap="2" justify="end">
                    {isRunning ? (
                        <Button
                            color="red"
                            onClick={onCancel}
                            disabled={progress.status === 'cancelling'}
                        >
                            {progress.status === 'cancelling' ? 'Cancelling…' : 'Cancel'}
                        </Button>
                    ) : (
                        <Button onClick={onClose}>Close</Button>
                    )}
                </Flex>
            </Flex>
        </Flex>
    );
};

export default ProgressStep;
