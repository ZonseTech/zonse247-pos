import React, { useState } from 'react';

interface VirtualKeyboardProps {
    onKeyPress: (key: string) => void;
    onBackspace: () => void;
    onEnter: () => void;
    onSpace: () => void;
    className?: string;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
    onKeyPress,
    onBackspace,
    onEnter,
    onSpace,
    className = ''
}) => {
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    const [capsLock, setCapsLock] = useState(false);

    const handleKeyPress = (key: string) => {
        let finalKey = key;

        if (isShiftPressed) {
            const shiftMap: { [key: string]: string } = {
                '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
                '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
                '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|',
                ';': ':', "'": '"', ',': '<', '.': '>', '/': '?',
                '`': '~'
            };
            finalKey = shiftMap[key] || key;
        }

        if (isLetter(key)) {
            if (isShiftPressed || capsLock) {
                finalKey = key.toUpperCase();
            }
        }

        onKeyPress(finalKey);

        if (isShiftPressed) {
            setIsShiftPressed(false);
        }
    };

    const handleShift = () => {
        setIsShiftPressed(!isShiftPressed);
    };

    const handleCapsLock = () => {
        setCapsLock(!capsLock);
        setIsShiftPressed(false);
    };

    const isLetter = (char: string) => {
        return /^[a-zA-Z]$/.test(char);
    };

    const getKeyDisplayText = (key: string, shiftKey?: string) => {
        if (isShiftPressed && shiftKey) {
            return shiftKey;
        }
        if ((isShiftPressed || capsLock) && isLetter(key)) {
            return key.toUpperCase();
        }
        return key;
    };

    const keyBaseClasses = "flex items-center justify-center text-xl font-semibold rounded-lg transition-all duration-150 select-none cursor-pointer active:scale-95 h-14 shadow-md";
    const regularKeyClasses = "bg-gradient-to-b from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 active:from-gray-300 active:to-gray-400 border border-gray-400 text-gray-800";
    const specialKeyClasses = "bg-gradient-to-b from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 active:from-gray-500 active:to-gray-600 border border-gray-500 text-gray-800";
    const activeSpecialClasses = "bg-gradient-to-b from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white border-blue-600";
    const backKeyClasses = "bg-gradient-to-b from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 border border-yellow-600 text-gray-800";
    const enterKeyClasses = "bg-gradient-to-b from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 border-green-600 text-white";

    const rowGridClass = "grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-1 auto-cols-fr";

    return (
        <div className={`bg-gradient-to-b from-gray-100 to-gray-200 p-3 border border-gray-300 rounded-none w-full min-w-0 ${className}`}>
            <div className="flex-1 space-y-2">
                <div className={rowGridClass}>
                    <button
                        onClick={() => handleKeyPress('`')}
                        className={`${keyBaseClasses} ${regularKeyClasses}`}
                        style={{ gridColumn: 'span 1' }}
                    >
                        <span className="text-xs">{getKeyDisplayText('`', '~')}</span>
                    </button>
                    {[
                        { key: '1', shift: '!' }, { key: '2', shift: '@' }, { key: '3', shift: '#' },
                        { key: '4', shift: '$' }, { key: '5', shift: '%' }, { key: '6', shift: '^' },
                        { key: '7', shift: '&' }, { key: '8', shift: '*' }, { key: '9', shift: '(' },
                        { key: '0', shift: ')' }, { key: '-', shift: '_' }, { key: '=', shift: '+' }
                    ].map(({ key, shift }) => (
                        <button
                            key={key}
                            onClick={() => handleKeyPress(key)}
                            className={`${keyBaseClasses} ${regularKeyClasses}`}
                            style={{ gridColumn: 'span 1' }}
                        >
                            <div className="flex flex-col items-center leading-none">
                                <span className="text-xs">{shift}</span>
                                <span>{key}</span>
                            </div>
                        </button>
                    ))}
                    <button
                        onClick={onBackspace}
                        className={`${keyBaseClasses} ${backKeyClasses}`}
                        style={{ gridColumn: 'span 2' }}
                    >
                        Backspace
                    </button>
                </div>

                <div className={rowGridClass}>
                    <button
                        onClick={() => handleKeyPress('\t')}
                        className={`${keyBaseClasses} ${specialKeyClasses}`}
                        style={{ gridColumn: 'span 1.6' }}
                    >
                        Tab
                    </button>
                    {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'].map((key) => {
                        const shiftKey = key === '[' ? '{' : key === ']' ? '}' : undefined;
                        return (
                            <button
                                key={key}
                                onClick={() => handleKeyPress(key)}
                                className={`${keyBaseClasses} ${regularKeyClasses}`}
                                style={{ gridColumn: 'span 1' }}
                            >
                                {shiftKey ? (
                                    <div className="flex flex-col items-center leading-none">
                                        <span className="text-xs">{shiftKey}</span>
                                        <span>{key}</span>
                                    </div>
                                ) : (
                                    getKeyDisplayText(key)
                                )}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => handleKeyPress('\\')}
                        className={`${keyBaseClasses} ${regularKeyClasses}`}
                        style={{ gridColumn: 'span 1.2' }}
                    >
                        <div className="flex flex-col items-center leading-none">
                            <span className="text-xs">|</span>
                            <span>\</span>
                        </div>
                    </button>
                </div>

                <div className={rowGridClass}>
                    <button
                        onClick={handleCapsLock}
                        className={`${keyBaseClasses} ${capsLock ? activeSpecialClasses : specialKeyClasses}`}
                        style={{ gridColumn: 'span 2' }}
                    >
                        Caps Lock
                    </button>
                    {['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"].map((key) => {
                        const shiftKey = key === ';' ? ':' : key === "'" ? '"' : undefined;
                        return (
                            <button
                                key={key}
                                onClick={() => handleKeyPress(key)}
                                className={`${keyBaseClasses} ${regularKeyClasses}`}
                                style={{ gridColumn: 'span 1' }}
                            >
                                {shiftKey ? (
                                    <div className="flex flex-col items-center leading-none">
                                        <span className="text-xs">{shiftKey}</span>
                                        <span>{key}</span>
                                    </div>
                                ) : (
                                    getKeyDisplayText(key)
                                )}
                            </button>
                        );
                    })}
                    <button
                        onClick={onEnter}
                        className={`${keyBaseClasses} ${enterKeyClasses}`}
                        style={{ gridColumn: 'span 1.6' }}
                    >
                        Enter
                    </button>
                </div>

                <div className={rowGridClass}>
                    <button
                        onClick={handleShift}
                        className={`${keyBaseClasses} ${isShiftPressed ? activeSpecialClasses : specialKeyClasses}`}
                        style={{ gridColumn: 'span 2.4' }}
                    >
                        Shift
                    </button>
                    {['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'].map((key) => {
                        const shiftKey = key === ',' ? '<' : key === '.' ? '>' : key === '/' ? '?' : undefined;
                        return (
                            <button
                                key={key}
                                onClick={() => handleKeyPress(key)}
                                className={`${keyBaseClasses} ${regularKeyClasses}`}
                                style={{ gridColumn: 'span 1' }}
                            >
                                {shiftKey ? (
                                    <div className="flex flex-col items-center leading-none">
                                        <span className="text-xs">{shiftKey}</span>
                                        <span>{key}</span>
                                    </div>
                                ) : (
                                    getKeyDisplayText(key)
                                )}
                            </button>
                        );
                    })}
                    <button
                        onClick={handleShift}
                        className={`${keyBaseClasses} ${isShiftPressed ? activeSpecialClasses : specialKeyClasses}`}
                        style={{ gridColumn: 'span 2.4' }}
                    >
                        Shift
                    </button>
                </div>

                <div className={rowGridClass}>
                    <button
                        onClick={() => handleKeyPress('ctrl')}
                        className={`${keyBaseClasses} ${specialKeyClasses}`}
                        style={{ gridColumn: 'span 1.6' }}
                    >
                        Ctrl
                    </button>
                    <button
                        onClick={() => handleKeyPress('alt')}
                        className={`${keyBaseClasses} ${specialKeyClasses}`}
                        style={{ gridColumn: 'span 1.2' }}
                    >
                        Alt
                    </button>
                    <button
                        onClick={onSpace}
                        className={`${keyBaseClasses} ${regularKeyClasses}`}
                        style={{ gridColumn: 'span 7.2' }}
                    >
                        space
                    </button>
                    <button
                        onClick={() => handleKeyPress('alt')}
                        className={`${keyBaseClasses} ${specialKeyClasses}`}
                        style={{ gridColumn: 'span 1.2' }}
                    >
                        Alt
                    </button>
                    <button
                        onClick={() => handleKeyPress('ctrl')}
                        className={`${keyBaseClasses} ${specialKeyClasses}`}
                        style={{ gridColumn: 'span 1.6' }}
                    >
                        Ctrl
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VirtualKeyboard;