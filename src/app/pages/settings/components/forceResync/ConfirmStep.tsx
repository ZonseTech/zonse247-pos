import { FunctionComponent } from 'react';
import { Button, Callout, DataList, Flex } from '@radix-ui/themes';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import {
    FORCE_RESYNC_LIMITS,
    FORCE_RESYNC_TABLE_ORDER,
} from '../../../../services/sync.service';
import ModeSelector from './ModeSelector';
import { formatLastRun } from './utils';

interface ConfirmStepProps {
    mode: ForceResyncMode;
    bridgeAvailable: boolean;
    lastRunAt: string | null;
    onModeChange: (mode: ForceResyncMode) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmStep: FunctionComponent<ConfirmStepProps> = ({
    mode,
    bridgeAvailable,
    lastRunAt,
    onModeChange,
    onConfirm,
    onCancel,
}) => (
    <Flex direction="column" gap="4">
        <Callout.Root color="amber" variant="surface">
            <Callout.Icon>
                <AlertTriangle size={16} />
            </Callout.Icon>
            <Callout.Text>
                <strong>This is a maintenance operation.</strong> Force resync ignores
                the normal change watermark and re-processes every record in scope. It
                can take several minutes and consume significant bandwidth. Only run it
                when troubleshooting or after a server outage.
            </Callout.Text>
        </Callout.Root>

        <ModeSelector
            mode={mode}
            bridgeAvailable={bridgeAvailable}
            onChange={onModeChange}
        />

        <DataList.Root size="2" orientation="horizontal">
            <DataList.Item align="center">
                <DataList.Label minWidth="120px">Last run</DataList.Label>
                <DataList.Value>{formatLastRun(lastRunAt)}</DataList.Value>
            </DataList.Item>
            <DataList.Item align="center">
                <DataList.Label minWidth="120px">Chunk size</DataList.Label>
                <DataList.Value>
                    {FORCE_RESYNC_LIMITS.DEFAULT_CHUNK_SIZE.toLocaleString()} rows
                </DataList.Value>
            </DataList.Item>
            <DataList.Item align="center">
                <DataList.Label minWidth="120px">Max per table</DataList.Label>
                <DataList.Value>
                    {FORCE_RESYNC_LIMITS.MAX_RECORDS_PER_TABLE.toLocaleString()} rows
                </DataList.Value>
            </DataList.Item>
            <DataList.Item align="center">
                <DataList.Label minWidth="120px">Tables</DataList.Label>
                <DataList.Value>{FORCE_RESYNC_TABLE_ORDER.length}</DataList.Value>
            </DataList.Item>
        </DataList.Root>

        <Flex justify="end" gap="2" mt="2">
            <Button variant="soft" color="gray" onClick={onCancel}>
                Cancel
            </Button>
            <Button color="amber" onClick={onConfirm}>
                <RefreshCcw size={16} />
                Start Force Resync
            </Button>
        </Flex>
    </Flex>
);

export default ConfirmStep;
