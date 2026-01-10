import { ExternalLink } from 'lucide-react';
import { Button } from '../../../components';
import CustomModal from '../../../components/Modal';

interface SetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    setupInstructions: PrintAgentSetupInstructions | null;
}

export const SetupModal = ({ isOpen, onClose, setupInstructions }: SetupModalProps) => (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Print Agent Setup Instructions">
        {setupInstructions ? (
            <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Platform Information</h4>
                    <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">OS:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100 capitalize">{setupInstructions.os}</span>
                    </div>
                </div>

                {setupInstructions.instructions?.length > 0 && (
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Setup Steps</h4>
                        <ol className="space-y-3">
                            {setupInstructions.instructions.map((step, i) => (
                                <li key={i} className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center justify-center">{i + 1}</span>
                                    <span className="text-gray-700 dark:text-gray-300">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {setupInstructions.commands?.length > 0 && (
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Commands</h4>
                        <div className="space-y-2">
                            {setupInstructions.commands.map((cmd, i) => (
                                <div key={i} className="p-3 bg-gray-800 dark:bg-gray-900 rounded-lg">
                                    <code className="text-sm text-green-400 font-mono break-all">{cmd}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {setupInstructions.links?.length > 0 && (
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Helpful Links</h4>
                        <ul className="space-y-2">
                            {setupInstructions.links.map((link, i) => (
                                <li key={i}>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4" />
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
                    <Button onClick={onClose} layout="outline">Close</Button>
                </div>
            </div>
        ) : (
            <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Loading setup instructions...</p>
            </div>
        )}
    </CustomModal>
);
