import { FunctionComponent } from 'react';
import { useFocusManager } from '../hooks/useFocusManager';

type NumpadType = 'standard' | 'simple' | 'basic';

interface NumpadProps {
    onButtonClick: (value: string) => void;
    className?: string;
    title?: string;
    focusManager?: ReturnType<typeof useFocusManager>;
    type?: NumpadType;
}

const Numpad: FunctionComponent<NumpadProps> = ({
    onButtonClick,
    className = '',
    focusManager,
    title,
    type = 'standard'
}) => {
    const getNumpadButtons = (numpadType: NumpadType): string[] => {
        switch (numpadType) {
            case 'simple':
                return [
                    '1', '2', '3',
                    '4', '5', '6',
                    '7', '8', '9',
                    'Del', '0', 'OK'
                ];
            case 'basic':
                return [
                    '1', '2', '3',
                    '4', '5', '6',
                    '7', '8', '9',
                    '•', '0', 'Del'
                ];
            case 'standard':
            default:
                return [
                    '1', '2', '3',
                    '4', '5', '6',
                    '7', '8', '9',
                    '0', '00', '000',
                    'Del', '•', 'OK'
                ];
        }
    };

    const numpadButtons = getNumpadButtons(type);

    const getButtonClass = (btn: string): string => {
        let buttonClass = "font-bold text-3xl py-10 font-bold transition-all ";
        if (btn === 'Del') {
            buttonClass += "bg-red-500 hover:bg-red-600 text-white";
        } else if (btn === 'OK') {
            buttonClass += "bg-orange-500 hover:bg-orange-600 text-white";
        } else {
            buttonClass += "bg-black hover:bg-gray-800 text-white";
        }
        return buttonClass;
    };

    return (
        <div>
            {title && <h3 className="text-3xl font-bold text-black dark:text-gray-400 mb-4 uppercase">{title}</h3>}

            <div className={`${className}`}>
                <div className="grid grid-cols-3 gap-1 numpad-container">
                    {numpadButtons.map((btn, index) => (
                        btn ? (
                            <button
                                key={index}
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    onButtonClick(btn);
                                }}
                                className={getButtonClass(btn)}
                                disabled={!focusManager || (!focusManager.activeComponent)}
                                tabIndex={-1}
                            >
                                {btn}
                            </button>
                        ) : (
                            <div key={index} className="py-10" />
                        )
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Numpad;