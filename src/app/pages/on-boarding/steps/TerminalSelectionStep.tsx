import { FunctionComponent } from "react";
import { AlertCircle, Ban } from "lucide-react";
import StatusBadge from "../partials/StatusBadge";

const TerminalSelectionStep: FunctionComponent<{
    terminals: Array<Terminal>,
    selectedTerminal: Terminal,
    selectedBranch: Branch,
    onTerminalSelect: (terminal: Terminal) => void,
}> = ({
    terminals,
    selectedTerminal,
    selectedBranch,
    onTerminalSelect,
}) => {
        const isTerminalDisabled = (terminal: Terminal) => {
            return terminal.activationStatus === 'ACTIVATED' || terminal.activationStatus === 'SUSPENDED';
        };

        const handleTerminalClick = (terminal: Terminal) => {
            if (!isTerminalDisabled(terminal)) {
                onTerminalSelect(terminal);
            }
        };

        return (
            <div className="space-y-6 mb-4">
                {terminals.length > 0 && <div className="text-left">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Select terminal</h2>
                    <p className="text-gray-600">
                        Choose the terminal for <strong>{selectedBranch?.branchName}</strong>
                    </p>
                </div>}

                <div className="grid gap-4 max-h-[22rem] overflow-y-auto">
                    {terminals && terminals.length > 0 ? (
                        terminals.map((terminal) => {
                            const isDisabled = isTerminalDisabled(terminal);
                            const isSelected = selectedTerminal?.terminalId === terminal.terminalId;

                            return (
                                <div
                                    key={terminal.terminalId}
                                    onClick={() => handleTerminalClick(terminal)}
                                    className={`p-4 border rounded-lg transition-colors ${isDisabled
                                        ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                                        : isSelected
                                            ? 'border-sky-500 bg-sky-50 cursor-pointer'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className={`font-semibold flex items-center space-x-2 ${isDisabled ? 'text-gray-500' : 'text-gray-900'
                                                }`}>
                                                <span>{terminal.terminalLabel}-{terminal.terminalPosition}</span>
                                                {terminal.isPrimary && (
                                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                                        Primary
                                                    </span>
                                                )}
                                            </h3>
                                            <p className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-600'
                                                }`}>
                                                {terminal.osName}
                                            </p>
                                            {isDisabled && (
                                                <p className="text-xs text-orange-500 mt-1">
                                                    {terminal.activationStatus === 'ACTIVATED'
                                                        ? 'This terminal is currently active and cannot be selected'
                                                        : 'This terminal is suspended and cannot be selected'
                                                    }
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isDisabled && <Ban className="h-4 w-4 text-orange-500" />}
                                            <StatusBadge status={terminal.activationStatus} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12">
                            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No terminals Found</h3>
                            <p className="text-gray-500 mb-4">
                                No terminals are available for <strong>{selectedBranch?.branchName}</strong> at this time.
                            </p>
                            <p className="text-sm text-gray-400">
                                Please contact your administrator to set up terminals for this branch.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

export default TerminalSelectionStep;