import type { FunctionComponent, ChangeEvent } from 'react';

interface ToggleOptionProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    title: string;
    description?: string;
    disabled?: boolean;
    accentColor?: string;
}

const ToggleOption: FunctionComponent<ToggleOptionProps> = ({
    checked,
    onChange,
    title,
    description,
    disabled = false,
    accentColor = 'sky'
}) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!disabled) {
            onChange(e.target.checked);
        }
    };

    const accentClasses: Record<string, string> = {
        sky: 'accent-sky-500 text-sky-500',
        emerald: 'accent-emerald-500 text-emerald-500',
        purple: 'accent-purple-500 text-purple-500',
        amber: 'accent-amber-500 text-amber-500',
    };

    return (
        <label className={`flex items-start space-x-3 cursor-pointer p-3 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={handleChange}
                disabled={disabled}
                className={`h-5 w-5 mt-0.5 focus:ring-0 focus:ring-offset-0 border-gray-300 rounded ${accentClasses[accentColor] || accentClasses.sky}`}
            />
            <div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 block">
                    {title}
                </span>
                {description && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {description}
                    </span>
                )}
            </div>
        </label>
    );
};

export default ToggleOption;
