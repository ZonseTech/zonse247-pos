import { FunctionComponent } from 'react';
import { DashedDivider } from './ReceiptDividers';

interface ReceiptFooterProps {
    footerMessage?: string;
}

const ReceiptFooter: FunctionComponent<ReceiptFooterProps> = ({ footerMessage }) => {
    return (
        <>
            <DashedDivider />
            <div className="text-center px-4 py-3 space-y-1">
                <p className="text-[10px]">
                    {footerMessage || 'Thank you for your business!'}
                </p>
                <p className="text-[9px] text-zinc-500 dark:text-zinc-400">
                    Powered by Zonse247 POS
                </p>
            </div>
            <div
                className="h-3 bg-gradient-to-b from-transparent to-gray-100 dark:to-gray-700"
                style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, currentColor 4px, currentColor 8px)',
                    backgroundSize: '8px 2px',
                    backgroundPosition: 'bottom',
                    backgroundRepeat: 'repeat-x'
                }}
            />
        </>
    );
};

export default ReceiptFooter;