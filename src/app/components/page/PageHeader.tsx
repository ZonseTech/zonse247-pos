import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import React, { PropsWithChildren, ReactNode } from 'react';
import { Flex, Heading, Text, IconButton, Box } from '@radix-ui/themes';
import { PageHeaderPortal } from '../../context/PageHeaderContext';
import { useIsMobile, useIsElectron } from '../../hooks/useMediaQuery';

interface PageHeaderProps {
    title?: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
    compact?: boolean;
    showBackButton?: boolean;
    onBack?: () => void;
}

const PageHeader: React.FC<PropsWithChildren<PageHeaderProps>> = ({
    title = "Page Title",
    description = "Page description",
    icon,
    action,
    children,
    className = "",
    compact = false,
    showBackButton = false,
    onBack
}) => {
    const isMobile = useIsMobile();
    const isElectron = useIsElectron();
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    const headerContent = (
        <Box asChild>
            <header
                className={`flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${className}`}
            >
                <Flex
                    justify="between"
                    align="center"
                    gap={compact ? "2" : "3"}
                    py={compact ? "2" : "3"}
                    px={{ initial: "4" }}
                >
                    <Flex
                        align="center"
                        gap={compact ? "2" : "3"}
                        flexGrow="1"
                        minWidth="0"
                    >
                        {(showBackButton || isMobile) && (
                            <IconButton
                                variant="ghost"
                                color="gray"
                                size="1"
                                onClick={handleBack}
                                aria-label="Go back"
                                className="-ml-1 active:scale-95 transition-all"
                            >
                                <ArrowLeft className={compact ? "w-4 h-4" : "w-5 h-5"} />
                            </IconButton>
                        )}
                        {/* {icon && !isMobile && !isElectron && (
                            <Box flexShrink="0" className="[&>svg]:w-6 [&>svg]:h-6">
                                {icon}
                            </Box>
                        )} */}
                        <Box flexGrow="1" minWidth="0">
                            <Heading
                                as="h1"
                                size={compact ? "2" : "4"}
                                weight="bold"
                                truncate
                            >
                                {title}
                            </Heading>
                            {!compact && description && (
                                <Text
                                    as="p"
                                    size="2"
                                    color="gray"
                                    truncate
                                    className="mt-0.5 hidden md:block"
                                >
                                    {description}
                                </Text>
                            )}
                        </Box>
                    </Flex>

                    {action && (
                        <Box flexShrink="0">
                            {action}
                        </Box>
                    )}
                </Flex>

                {children && (
                    <Box
                        px={{ initial: "4", md: "6" }}
                        py={compact ? "1" : "2"}
                        className="border-t border-gray-100 dark:border-gray-800"
                    >
                        {children}
                    </Box>
                )}
            </header>
        </Box>
    );

    return <PageHeaderPortal>{headerContent}</PageHeaderPortal>;
};

export default PageHeader;