import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CopyButtonProps {
    text: string;
    className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text, className = '' }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-amber-100 text-amber-700 text-xs rounded transition-all ${className}`}
        >
            {copied ? (
                <>
                    <Check className="w-3 h-3" />
                    Copied
                </>
            ) : (
                <>
                    <Copy className="w-3 h-3" />
                    Copy
                </>
            )}
        </button>
    );
};