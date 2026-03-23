import { ExternalLink } from 'lucide-react';
import { Card, Code, Dialog, Flex, Heading, Separator, Spinner, Text } from '@radix-ui/themes';
import { Button } from '../../../components';

interface SetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    setupInstructions: PrintAgentSetupInstructions | null;
}

export const SetupModal = ({ isOpen, onClose, setupInstructions }: SetupModalProps) => (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <Dialog.Content maxWidth="560px">
            <Dialog.Title>Print Agent Setup Instructions</Dialog.Title>
            <Dialog.Description size="2" color="gray" mb="4">
                Follow these steps to configure the print agent on your system.
            </Dialog.Description>

            {setupInstructions ? (
                <Flex direction="column" gap="5">
                    <Card size="2" variant="surface">
                        <Heading size="3" mb="2">Platform Information</Heading>
                        <Flex gap="2">
                            <Text size="2" color="gray">OS:</Text>
                            <Text size="2" weight="medium" className="capitalize">{setupInstructions.os}</Text>
                        </Flex>
                    </Card>

                    {setupInstructions.instructions?.length > 0 && (
                        <Flex direction="column" gap="3">
                            <Heading size="3">Setup Steps</Heading>
                            <ol className="space-y-3">
                                {setupInstructions.instructions.map((step, i) => (
                                    <li key={i}>
                                        <Flex gap="3">
                                            <Flex align="center" justify="center" className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-400">
                                                <Text size="1" weight="medium">{i + 1}</Text>
                                            </Flex>
                                            <Text size="2" color="gray">{step}</Text>
                                        </Flex>
                                    </li>
                                ))}
                            </ol>
                        </Flex>
                    )}

                    {setupInstructions.commands?.length > 0 && (
                        <Flex direction="column" gap="3">
                            <Heading size="3">Commands</Heading>
                            <Flex direction="column" gap="2">
                                {setupInstructions.commands.map((cmd, i) => (
                                    <div key={i} className="p-3 bg-gray-800 dark:bg-gray-900 rounded-lg">
                                        <Code size="2" color="green" className="break-all">{cmd}</Code>
                                    </div>
                                ))}
                            </Flex>
                        </Flex>
                    )}

                    {setupInstructions.links?.length > 0 && (
                        <Flex direction="column" gap="3">
                            <Heading size="3">Helpful Links</Heading>
                            <Flex direction="column" gap="2">
                                {setupInstructions.links.map((link, i) => (
                                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer">
                                        <Flex align="center" gap="2" className="text-sky-600 dark:text-sky-400 hover:underline">
                                            <ExternalLink className="w-4 h-4" />
                                            <Text size="2">{link.label}</Text>
                                        </Flex>
                                    </a>
                                ))}
                            </Flex>
                        </Flex>
                    )}

                    <Separator size="4" />

                    <Flex justify="end">
                        <Dialog.Close>
                            <Button layout="outline">Close</Button>
                        </Dialog.Close>
                    </Flex>
                </Flex>
            ) : (
                <Flex direction="column" align="center" py="8" gap="4">
                    <Spinner size="3" />
                    <Text size="2" color="gray">Loading setup instructions...</Text>
                </Flex>
            )}
        </Dialog.Content>
    </Dialog.Root>
);
