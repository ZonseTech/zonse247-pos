import { type ReactNode, type FunctionComponent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { X } from 'lucide-react';
import { Box, Flex, Text, ScrollArea, Theme } from '@radix-ui/themes';
import classNames from 'classnames';

export type FormModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';

const SIZE_CLASSES: Record<FormModalSize, string> = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-2xl',
    '2xl': 'sm:max-w-4xl',
    '3xl': 'sm:max-w-6xl',
    full: 'sm:max-w-[96vw]',
};

interface FormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: ReactNode;
    /** Short a11y description of the modal's purpose; falls back to the title when omitted. */
    description?: string;
    icon?: ReactNode;
    iconClassName?: string;
    size?: FormModalSize;
    /** Optional element (e.g. a Button) rendered as the Dialog trigger. Omit for fully controlled usage. */
    trigger?: ReactNode;
    /** Optional sticky footer (e.g. Cancel/Submit buttons), pinned below the scrollable body. */
    footer?: ReactNode;
    children: ReactNode;
    contentClassName?: string;
}

/**
 * Reusable Radix Dialog shell for create/edit forms.
 * Renders as a bottom sheet on mobile and a centered dialog on desktop, with an
 * independently scrollable body and pinned header/footer.
 */
const FormModal: FunctionComponent<FormModalProps> = ({
    open,
    onOpenChange,
    title,
    description,
    icon,
    iconClassName = 'bg-sky-50 dark:bg-sky-900/20 text-sky-500 dark:text-sky-400',
    size = 'md',
    trigger,
    footer,
    children,
    contentClassName,
}) => (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
        {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
        <Dialog.Portal>
            <Theme appearance="inherit" accentColor="cyan">
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
                <Dialog.Content
                    className={classNames(
                        'fixed z-50 flex flex-col',
                        'bottom-0 left-0 right-0 max-h-[90vh]',
                        'sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
                        'sm:w-[calc(100%-2rem)] sm:max-h-[85vh]',
                        SIZE_CLASSES[size],
                        'data-[state=open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
                        'data-[state=open]:slide-in-from-bottom sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95',
                        'data-[state=closed]:slide-out-to-bottom sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-95',
                        'duration-200',
                        contentClassName,
                    )}
                >
                    {/* Visual clipping (rounded corners, scroll) lives on this inner wrapper rather than
                        Dialog.Content itself — combining overflow-hidden with the transform above on the
                        same element clips native popups (e.g. the <input type="date"> calendar) in Chromium. */}
                    <div className="flex flex-col flex-1 min-h-0 overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-800 shadow-2xl">
                        <div className="flex justify-center sm:hidden pt-2">
                            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        </div>

                        <Flex
                            justify="between"
                            align="center"
                            px="4"
                            py="3"
                            className="border-b border-gray-200 dark:border-gray-700 flex-shrink-0"
                        >
                            <Flex align="center" gap="3" className="min-w-0">
                                {icon && (
                                    <div className={classNames('p-2 rounded-lg flex-shrink-0', iconClassName)}>
                                        {icon}
                                    </div>
                                )}
                                <Dialog.Title asChild>
                                    <Text size="3" weight="bold" as="p" className="truncate">
                                        {title}
                                    </Text>
                                </Dialog.Title>
                            </Flex>
                            {description ? (
                                <VisuallyHidden asChild>
                                    <Dialog.Description>{description}</Dialog.Description>
                                </VisuallyHidden>
                            ) : null}
                            <Dialog.Close asChild>
                                <button
                                    type="button"
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                                    aria-label="Close"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </Dialog.Close>
                        </Flex>

                        <ScrollArea scrollbars="vertical" className="flex-1">
                            <Box p="4">{children}</Box>
                        </ScrollArea>

                        {footer && (
                            <Box px="4" py="3" className="border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                                {footer}
                            </Box>
                        )}
                    </div>
                </Dialog.Content>
            </Theme>
        </Dialog.Portal>
    </Dialog.Root>
);

export default FormModal;
