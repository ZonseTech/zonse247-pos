import { FunctionComponent } from "react";
import { Button } from "../../../../components";
import StatusBadge from "../StatusBadge";
import { Monitor, AlertCircle } from "lucide-react";

const TerminalSelectionStep: FunctionComponent<{
    terminals: Array<Terminal>,
    selectedTerminal: Terminal,
    selectedBranch: Branch,
    onTerminalSelect,
    onSubmit,
    loading
}> = ({
    terminals,
    selectedTerminal,
    selectedBranch,
    onTerminalSelect,
    onSubmit,
    loading
}) => (
        <div className="space-y-6">
            {terminals.length > 0 && <div className="text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select terminal</h2>
                <p className="text-gray-600">
                    Choose the terminal for <strong>{selectedBranch?.branchName}</strong>
                </p>
            </div>}

            <div className="grid gap-4 max-h-[22rem] overflow-y-auto">
                {terminals && terminals.length > 0 ? (
                    terminals.map((terminal) => (
                        <div
                            key={terminal.terminalId}
                            onClick={() => onTerminalSelect(terminal)}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedTerminal?.terminalId === terminal.terminalId
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                } ${terminal.activationStatus === 'SUSPENDED' ? 'opacity-50' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                                        <span>{terminal.terminalLabel}-{terminal.terminalPosition}</span>
                                        {terminal.isPrimary && (
                                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                                Primary
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-gray-600 text-sm">{terminal.osName}</p>
                                </div>
                                <StatusBadge status={terminal.activationStatus} />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No terminals Found</h3>
                        <p className="text-gray-500 mb-4">
                            No terminals are available for <strong>{selectedBranch?.branchName}</strong> at this time.
                        </p>
                        <p className="text-sm text-gray-400">
                            Please contact your administrator to set up terminals for this shop.
                        </p>
                    </div>
                )}
            </div>

            {terminals && terminals.length > 0 && (
                <Button
                    onClick={onSubmit}
                    disabled={!selectedTerminal}
                    loading={loading}
                    icon={Monitor}
                    block
                    theme="success"
                >
                    {loading ? 'Configuring...' : 'Configure Machine'}
                </Button>
            )}
        </div>
    );

export default TerminalSelectionStep;