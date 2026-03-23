import { Activity, Play, Square, Settings, AlertCircle } from 'lucide-react';
import { Badge, Callout, Card, Flex, Text } from '@radix-ui/themes';
import { Button } from '../../../components';

interface PrintAgentCardProps {
    agentStatus: PrintAgentState | null;
    permissions: PrintAgentPermissions | null;
    isStarting: boolean;
    isStopping: boolean;
    agentLoading: boolean;
    isMobile: boolean;
    onStart: () => void;
    onStop: () => void;
    onShowSetup: () => void;
}

const getAgentStatusColor = (status?: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
        RUNNING: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-500 dark:text-green-400' },
        STOPPED: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400' },
        ERROR: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-500 dark:text-red-400' },
        STARTING: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
        STOPPING: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
    };
    return colors[status || ''] || colors.STOPPED;
};

const getAgentBadgeColor = (status?: string): 'green' | 'gray' | 'red' | 'yellow' => {
    const map: Record<string, 'green' | 'gray' | 'red' | 'yellow'> = {
        RUNNING: 'green', STOPPED: 'gray', ERROR: 'red', STARTING: 'yellow', STOPPING: 'yellow',
    };
    return map[status || ''] || 'gray';
};

export const PrintAgentCard = ({
    agentStatus,
    permissions,
    isStarting,
    isStopping,
    agentLoading,
    isMobile,
    onStart,
    onStop,
    onShowSetup
}: PrintAgentCardProps) => {
    const agentColors = getAgentStatusColor(agentStatus?.status);
    const badgeColor = getAgentBadgeColor(agentStatus?.status);

    return (
        <Card size="2" className="mb-4 mx-4 md:mx-0">
            <Flex direction={{ initial: 'column', lg: 'row' }} align={{ lg: 'center' }} justify="between" gap="4">
                <Flex align="center" gap="4">
                    <Flex align="center" justify="center" className={`p-3 rounded-lg ${agentColors.bg}`}>
                        <Activity className={`w-6 h-6 ${agentColors.text}`} />
                    </Flex>
                    <Flex direction="column" gap="1">
                        <Text size="3" weight="bold">Print Agent</Text>
                        <Flex align="center" gap="2" wrap="wrap">
                            <Badge color={badgeColor} variant="soft" size="1">
                                {agentStatus?.status || 'UNKNOWN'}
                            </Badge>
                            {agentStatus?.isRunning && (
                                <>
                                    <Text size="1" color="gray">• {agentStatus.connectedPrinters} printer(s)</Text>
                                    <Text size="1" color="gray">• {agentStatus.processedJobs} processed</Text>
                                </>
                            )}
                            {agentStatus?.lastError && <Text size="1" color="red">• Error occurred</Text>}
                        </Flex>
                    </Flex>
                </Flex>
                <Flex align="center" gap="2">
                    {!agentStatus?.isRunning ? (
                        <Button onClick={onStart} icon={Play} theme="success" size="small" disabled={isStarting || agentLoading}>
                            {isStarting ? 'Starting...' : 'Start Agent'}
                        </Button>
                    ) : (
                        <Button onClick={onStop} icon={Square} theme="danger" layout="outline" size="small" disabled={isStopping || agentLoading}>
                            {isStopping ? 'Stopping...' : 'Stop Agent'}
                        </Button>
                    )}
                    <Button onClick={onShowSetup} icon={Settings} layout="outline" theme="neutral" size="small">
                        {!isMobile && 'Setup'}
                    </Button>
                </Flex>
            </Flex>

            {permissions?.missingPermissions?.length > 0 && (
                <Callout.Root color="amber" size="1" mt="4">
                    <Callout.Icon>
                        <AlertCircle className="w-5 h-5" />
                    </Callout.Icon>
                    <Callout.Text>
                        <Text size="2" weight="medium">Missing Permissions</Text>
                        <Text size="1" as="p" mt="1">{permissions.missingPermissions.join(', ')}</Text>
                        {permissions.instructions && <Text size="1" as="p" color="gray" mt="1">{permissions.instructions}</Text>}
                    </Callout.Text>
                </Callout.Root>
            )}
        </Card>
    );
};
