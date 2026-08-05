import { FunctionComponent } from 'react';
import { Badge, Box, Button as RadixButton, Card, Flex, Heading, Separator, Spinner, Text } from '@radix-ui/themes';
import { CheckCircle2, ChevronLeft, Save } from 'lucide-react';
import ErrorAlert from '../partials/ErrorAlert';
import AuthLayout from '../../../layouts/AuthLayout';
import type { TerminalDetailsViewProps } from '../types';

/**
 * Detail row component for terminal info display
 */
interface DetailRowProps {
    label: string;
    value: string;
    mono?: boolean;
}

const DetailRow: FunctionComponent<DetailRowProps> = ({ label, value, mono = false }) => (
    <Flex justify="between" align="center" py="3" className="border-b border-slate-200/80 last:border-b-0">
        <Text size="2" color="gray">{label}</Text>
        <Text size="2" weight="medium" className={mono ? 'font-mono' : ''}>
            {value}
        </Text>
    </Flex>
);

/**
 * Terminal details view - shows fetched terminal info with save button
 */
const TerminalDetailsView: FunctionComponent<TerminalDetailsViewProps> = ({
    terminal,
    error,
    loading,
    onSave,
    onBack,
}) => {
    return (
        <AuthLayout className="py-0">
            <Card size="2" style={{ '--base-card-surface-box-shadow': 'none' } as any} className="border-none bg-[color:var(--color-panel)]">
                <Flex direction="column" gap="4">
                    <Box className="text-center">
                        <Flex align="center" justify="center" gap="2" mb="2">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            <Heading as="h2" size="4">
                                Terminal details
                            </Heading>
                        </Flex>
                        <Text size="2" color="gray">
                            Review the information below and continue with setup.
                        </Text>
                    </Box>

                    {error && <ErrorAlert message={error} />}

                    <Box className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:bg-slate-900/30">
                        <Flex align="center" justify="between" mb="3">
                            <Text size="2" weight="medium">
                                Ready to sync
                            </Text>
                            <Badge color="green">Verified</Badge>
                        </Flex>
                        <Separator size="4" mb="3" />
                        <Box>
                            <DetailRow label="Terminal" value={terminal.terminalLabel} />
                            {terminal.branch && (
                                <DetailRow label="Branch" value={terminal.branch.branchName} />
                            )}
                            {terminal.tenant && (
                                <DetailRow label="Business" value={terminal.tenant.businessName} />
                            )}
                            {terminal.tenant?.country && (
                                <DetailRow label="Country" value={terminal.tenant.country} mono />
                            )}
                        </Box>
                    </Box>

                    <RadixButton size="3" onClick={onSave} disabled={loading} className="w-full justify-center">
                        {loading ? (
                            <Flex align="center" justify="center" gap="2">
                                <Spinner size="1" />
                                <span>Saving details...</span>
                            </Flex>
                        ) : (
                            <Flex align="center" justify="center" gap="2">
                                <Save className="w-4 h-4" />
                                <span>Continue setup</span>
                            </Flex>
                        )}
                    </RadixButton>

                    <RadixButton variant="soft" size="2" onClick={onBack} disabled={loading} className="w-full justify-center">
                        <Flex align="center" justify="center" gap="2">
                            <ChevronLeft className="w-4 h-4" />
                            <span>Use a different activation code</span>
                        </Flex>
                    </RadixButton>
                </Flex>
            </Card>
        </AuthLayout>
    );
};

export default TerminalDetailsView;
