import { Activity, Play, Square, Settings, AlertCircle } from 'lucide-react';
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
        RUNNING: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
        STOPPED: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400' },
        ERROR: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
        STARTING: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
        STOPPING: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
    };
    return colors[status || ''] || colors.STOPPED;
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

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 mx-4 md:mx-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${agentColors.bg}`}>
                        <Activity className={`w-6 h-6 ${agentColors.text}`} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Print Agent</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${agentColors.bg} ${agentColors.text}`}>
                                {agentStatus?.status || 'UNKNOWN'}
                            </span>
                            {agentStatus?.isRunning && (
                                <>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">• {agentStatus.connectedPrinters} printer(s)</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">• {agentStatus.processedJobs} processed</span>
                                </>
                            )}
                            {agentStatus?.lastError && <span className="text-xs text-red-500">• Error occurred</span>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
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
                </div>
            </div>

            {permissions?.missingPermissions?.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Missing Permissions</p>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">{permissions.missingPermissions.join(', ')}</p>
                            {permissions.instructions && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{permissions.instructions}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
