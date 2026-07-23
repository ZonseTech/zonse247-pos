import type { FunctionComponent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Flex, Text, ScrollArea, Theme } from '@radix-ui/themes';
import { X } from 'lucide-react';
import ReportAnalyticsPanel from './ReportAnalyticsPanel';
import { REPORT_DETAIL_CONFIGS } from './reportDetailConfigs';
import { REPORT_ID_ICONS } from './reportVisuals';
import type { DetailErrorState, DetailLoadingState, ReportDetailRawData, ReportId } from '../../../hooks/useReportsSummary';

export interface ReportDetailModalProps {
    reportId: ReportId;
    detailData: ReportDetailRawData;
    detailLoading: DetailLoadingState;
    detailErrors: DetailErrorState;
    onRetry: (reportId: NonNullable<ReportId>) => void;
    onClose: () => void;
}

const ReportDetailModal: FunctionComponent<ReportDetailModalProps> = ({
    reportId,
    detailData,
    detailLoading,
    detailErrors,
    onRetry,
    onClose,
}) => {
    if (!reportId) return null;

    const config = REPORT_DETAIL_CONFIGS[reportId];

    return (
        <Dialog.Root open={!!reportId} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Theme appearance="inherit" accentColor="cyan">
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl max-h-[85vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        <Flex
                            justify="between"
                            align="center"
                            p="4"
                            className="border-b border-gray-200 dark:border-gray-700 flex-shrink-0"
                        >
                            <Flex align="center" gap="3">
                                <div className="p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg text-sky-500 dark:text-sky-400">
                                    {REPORT_ID_ICONS[reportId]}
                                </div>
                                <Dialog.Title asChild>
                                    <Text size="3" weight="bold" as="p" className="leading-tight">
                                        {config.title}
                                    </Text>
                                </Dialog.Title>
                            </Flex>
                            <Dialog.Close asChild>
                                <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </Dialog.Close>
                        </Flex>

                        <ScrollArea scrollbars="vertical" style={{ maxHeight: 'calc(85vh - 68px)' }}>
                            <div className="p-4">
                                <ReportAnalyticsPanel
                                    reportId={reportId}
                                    rawData={detailData[reportId]}
                                    isLoading={detailLoading[reportId]}
                                    error={detailErrors[reportId]}
                                    onRetry={() => onRetry(reportId)}
                                />
                            </div>
                        </ScrollArea>
                    </Dialog.Content>
                </Theme>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default ReportDetailModal;
