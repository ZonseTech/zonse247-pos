import { FunctionComponent, useState } from 'react';
import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { RefreshCcw, ShieldCheck } from 'lucide-react';
import { useForceResync } from '../../../../hooks/useForceResync';
import ForceResyncModal from './ForceResyncModal';
import { formatLastRun } from './utils';

/**
 * Settings entry-point card for the Force Data Resync flow.
 */
const ForceResyncCard: FunctionComponent = () => {
    const [open, setOpen] = useState(false);
    const { lastRunAt, isRunning } = useForceResync();

    return (
        <Card size="2" variant="surface">
            <Flex
                direction={{ initial: 'column', sm: 'row' }}
                align={{ initial: 'stretch', sm: 'center' }}
                justify="between"
                gap="3"
            >
                <Flex align="start" gap="3" style={{ flex: 1, minWidth: 0 }}>
                    <Box className="p-2 rounded-lg bg-[var(--amber-a3)] text-[var(--amber-11)]">
                        <ShieldCheck size={20} />
                    </Box>
                    <Box style={{ minWidth: 0 }}>
                        <Heading as="h3" size="3" weight="medium">
                            Force Data Resync
                        </Heading>
                        <Text as="p" size="2" color="gray">
                            Re-process all records ignoring the change watermark. Use only for
                            troubleshooting or after a server outage.
                        </Text>
                        <Text as="p" size="1" color="gray" mt="1">
                            Last run: {formatLastRun(lastRunAt)}
                        </Text>
                    </Box>
                </Flex>
                <Button
                    type="button"
                    color="amber"
                    variant="soft"
                    disabled={isRunning}
                    onClick={() => setOpen(true)}
                    aria-label="Open force data resync"
                >
                    <RefreshCcw size={16} />
                    {isRunning ? 'Sync running…' : 'Force Resync'}
                </Button>
            </Flex>

            <ForceResyncModal isOpen={open} onClose={() => setOpen(false)} />
        </Card>
    );
};

export default ForceResyncCard;
