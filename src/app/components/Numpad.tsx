import { FunctionComponent } from 'react';
import { useFocusManager } from '../hooks/useFocusManager';

interface NumpadProps {
    onButtonClick: (value: string) => void;
    className?: string;
    focusManager?: ReturnType<typeof useFocusManager>;
}

const Numpad: FunctionComponent<NumpadProps> = ({ onButtonClick, className = '', focusManager }) => {
    const numpadButtons = [
        '1', '2', '3',
        '4', '5', '6',
        '7', '8', '9',
        '0', '00', '000',
        'Del', '•', 'OK'
    ];

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

    const getFocusIndicatorText = (): string => {
        if (!focusManager) return 'NUMPAD';

        const { activeComponent, activeItemId } = focusManager;

        if (activeComponent === 'barcode') {
            return 'SCANNING MODE';
        } else if (activeComponent === 'quantity' && activeItemId) {
            return 'QUANTITY MODE';
        }

        return 'NUMPAD - CLICK TO FOCUS';
    };

    const getFocusIndicatorColor = (): string => {
        if (!focusManager) return 'bg-gray-600';

        const { activeComponent } = focusManager;

        if (activeComponent === 'barcode') {
            return 'bg-blue-600';
        } else if (activeComponent === 'quantity') {
            return 'bg-green-600';
        }

        return 'bg-gray-600';
    };

    return (
        <div className={`${className}`}>
            <div className={`${getFocusIndicatorColor()} text-white text-center py-2 mb-2 text-sm font-bold`}>
                {getFocusIndicatorText()}
            </div>

            <div className="grid grid-cols-3 gap-1 numpad-container">
                {numpadButtons.map((btn, index) => (
                    <button
                        key={index}
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
                ))}
            </div>
        </div>
    );
};

export default Numpad;