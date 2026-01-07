import React, { useState, FunctionComponent, useCallback } from 'react';
import { useFocusManager } from '../hooks/useFocusManager';

type KeyboardVariant = 'numpad' | 'full';
type NumpadType = 'standard' | 'simple' | 'basic';
type KeyboardTheme = 'default' | 'dark' | 'light';

interface KeyboardSettings {
    theme?: KeyboardTheme;
    enableSound?: boolean;
    enableHaptic?: boolean;
}

interface InputKeyboardProps {
    variant: KeyboardVariant;
    className?: string;
    title?: string;
    onButtonClick?: (value: string) => void;
    focusManager?: ReturnType<typeof useFocusManager>;
    numpadType?: NumpadType;
    onKeyPress?: (key: string) => void;
    onBackspace?: () => void;
    onEnter?: () => void;
    onSpace?: () => void;
    settings?: KeyboardSettings;
}

const InputKeyboard: FunctionComponent<InputKeyboardProps> = ({
    variant,
    className = '',
    title,
    onButtonClick,
    focusManager,
    numpadType = 'standard',
    onKeyPress,
    onBackspace,
    onEnter,
    onSpace,
    settings = {},
}) => {
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    const [capsLock, setCapsLock] = useState(false);

    const { theme = 'default', enableSound = false, enableHaptic = false } = settings;

    // Sound feedback
    const playKeySound = useCallback(() => {
        if (!enableSound) return;
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
        } catch (e) {
            // Silently fail if audio context is not supported
        }
    }, [enableSound]);

    // Haptic feedback
    const triggerHaptic = useCallback(() => {
        if (!enableHaptic) return;
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }, [enableHaptic]);

    // Combined feedback handler
    const triggerFeedback = useCallback(() => {
        playKeySound();
        triggerHaptic();
    }, [playKeySound, triggerHaptic]);

    const getNumpadButtons = (type: NumpadType): string[] => {
        switch (type) {
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

    const getNumpadButtonClass = (btn: string): string => {
        let buttonClass = "font-bold text-md font-bold transition-all h-full ";

        if (btn === 'Del') {
            buttonClass += "bg-red-500 hover:bg-red-600 text-white";
        } else if (btn === 'OK') {
            buttonClass += "bg-orange-500 hover:bg-orange-600 text-white";
        } else {
            buttonClass += "bg-black hover:bg-gray-800 text-white";
        }

        return buttonClass;
    };

    const handleFullKeyPress = (key: string) => {
        triggerFeedback();
        if (!onKeyPress) return;

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
        triggerFeedback();
        setIsShiftPressed(!isShiftPressed);
    };

    const handleCapsLock = () => {
        triggerFeedback();
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

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    // Wrapper handlers with feedback
    const handleBackspaceClick = () => {
        triggerFeedback();
        onBackspace?.();
    };

    const handleEnterClick = () => {
        triggerFeedback();
        onEnter?.();
    };

    const handleSpaceClick = () => {
        triggerFeedback();
        onSpace?.();
    };

    // Theme-based classes
    const getThemeClasses = () => {
        switch (theme) {
            case 'dark':
                return {
                    container: 'bg-gray-900',
                    title: 'text-gray-300',
                    regularKey: 'bg-gradient-to-b from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 active:from-gray-500 active:to-gray-600 border border-gray-600 text-gray-200',
                    specialKey: 'bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 active:from-gray-400 active:to-gray-500 border border-gray-500 text-gray-200',
                };
            case 'light':
                return {
                    container: 'bg-gray-100',
                    title: 'text-gray-800',
                    regularKey: 'bg-gradient-to-b from-white to-gray-100 hover:from-gray-100 hover:to-gray-200 active:from-gray-200 active:to-gray-300 border border-gray-300 text-gray-800',
                    specialKey: 'bg-gradient-to-b from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 active:from-gray-400 active:to-gray-500 border border-gray-400 text-gray-800',
                };
            default:
                return {
                    container: 'bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900',
                    title: 'text-black dark:text-gray-400',
                    regularKey: 'bg-gradient-to-b from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 active:from-gray-300 active:to-gray-400 border border-gray-400 text-gray-800 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 dark:active:from-gray-500 dark:active:to-gray-600 dark:border-gray-600 dark:text-gray-200',
                    specialKey: 'bg-gradient-to-b from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 active:from-gray-500 active:to-gray-600 border border-gray-500 text-gray-800 dark:from-gray-600 dark:to-gray-700 dark:hover:from-gray-500 dark:hover:to-gray-600 dark:active:from-gray-400 dark:active:to-gray-500 dark:border-gray-500 dark:text-gray-200',
                };
        }
    };

    const themeClasses = getThemeClasses();

    const keyBaseClasses = "flex items-center justify-center text-xl font-semibold rounded-lg transition-all duration-150 select-none cursor-pointer active:scale-95 h-14 shadow-sm";
    const regularKeyClasses = themeClasses.regularKey;
    const specialKeyClasses = themeClasses.specialKey;
    const activeSpecialClasses = "bg-gradient-to-b from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white border-blue-600 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-400 dark:hover:to-blue-500 dark:border-blue-500";
    const backKeyClasses = "bg-gradient-to-b from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 border border-yellow-600 text-gray-800 dark:from-yellow-500 dark:to-yellow-600 dark:hover:from-yellow-400 dark:hover:to-yellow-500 dark:border-yellow-500 dark:text-gray-900";
    const enterKeyClasses = "bg-gradient-to-b from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 border-green-600 text-white dark:from-green-500 dark:to-green-600 dark:hover:from-green-400 dark:hover:to-green-500 dark:border-green-500";
    const rowGridClass = "grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-1 auto-cols-fr";

    if (variant === 'numpad') {
        const numpadButtons = getNumpadButtons(numpadType);

        return (
            <div className="flex flex-col h-[calc(56vh)]">
                {title && <h3 className={`text-3xl font-bold mb-4 uppercase ${themeClasses.title}`}>{title}</h3>}
                <div className={`flex-1 ${className}`}>
                    <div className="grid grid-cols-3 gap-1 h-full" style={{ gridTemplateRows: 'repeat(5, 1fr)' }}>
                        {numpadButtons.map((btn, index) => (
                            btn ? (
                                <button
                                    key={index}
                                    type="button"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        triggerFeedback();
                                        onButtonClick?.(btn);
                                    }}
                                    className={getNumpadButtonClass(btn)}
                                    disabled={!focusManager || (!focusManager.activeComponent)}
                                    tabIndex={-1}
                                >
                                    {btn}
                                </button>
                            ) : (
                                <div key={index} />
                            )
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`virtual-keyboard ${themeClasses.container} p-3 border-none border-gray-300 dark:border-gray-600 rounded-none w-full min-w-0 ${className}`}>
            {title && <h3 className={`text-xl font-bold mb-3 uppercase ${themeClasses.title}`}>{title}</h3>}
            <div className="flex-1 space-y-2">
                <div className={rowGridClass}>
                    <button
                        type="button"
                        onMouseDown={handleMouseDown}
                        onClick={() => handleFullKeyPress('`')}
                        className={`${keyBaseClasses} ${regularKeyClasses}`}
                        style={{ gridColumn: 'span 1' }}
                        tabIndex={-1}
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
                            type="button"
                            key={key}
                            onMouseDown={handleMouseDown}
                            onClick={() => handleFullKeyPress(key)}
                            className={`${keyBaseClasses} ${regularKeyClasses}`}
                            style={{ gridColumn: 'span 1' }}
                            tabIndex={-1}
                        >
                            <div className="flex flex-col items-center leading-none">
                                <span className="text-xs">{shift}</span>
                                <span>{key}</span>
                            </div>
                        </button>
                    ))}
                    <button
                        type="button"
                        onMouseDown={handleMouseDown}
                        onClick={handleBackspaceClick}
                        className={`${keyBaseClasses} ${backKeyClasses}`}
                        style={{ gridColumn: 'span 2' }}
                        tabIndex={-1}
                    >
                        Backspace
                    </button>
                </div>

                <div className={rowGridClass}>
                    <button
                        type="button"
                        onMouseDown={handleMouseDown}
                        onClick={() => handleFullKeyPress('\t')}
                        className={`${keyBaseClasses} ${specialKeyClasses}`}
                        style={{ gridColumn: 'span 1.6' }}
                        tabIndex={-1}
                    >
                        Tab
                    </button>
                    {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'].map((key) => {
                        const shiftKey = key === '[' ? '{' : key === ']' ? '}' : undefined;
                        return (
                            <button
                                type="button"
                                key={key}
                                onMouseDown={handleMouseDown}
                                onClick={() => handleFullKeyPress(key)}
                                className={`${keyBaseClasses} ${regularKeyClasses}`}
                                style={{ gridColumn: 'span 1' }}
                                tabIndex={-1}
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
                        type="button"
                        onMouseDown={handleMouseDown}
                        onClick={() => handleFullKeyPress('\\')}
                        className={`${keyBaseClasses} ${regularKeyClasses}`}
                        style={{ gridColumn: 'span 1.2' }}
                        tabIndex={-1}
                    >
                        <div className="flex flex-col items-center leading-none">
                            <span className="text-xs">|</span>
                            <span>\</span>
                        </div>
                    </button>
                </div>

                <div className={rowGridClass}>
                    <button
                        type="button"
                        onMouseDown={handleMouseDown}
                        onClick={handleCapsLock}
                        className={`${keyBaseClasses} ${capsLock ? activeSpecialClasses : specialKeyClasses}`}
                        style={{ gridColumn: 'span 2' }}
                        tabIndex={-1}
                    >
                        Caps Lock
                    </button>
                    {['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"].map((key) => {
                        const shiftKey = key === ';' ? ':' : key === "'" ? '"' : undefined;
                        return (
                            <button
                                type="button"
                                key={key}
                                onMouseDown={handleMouseDown}
                                onClick={() => handleFullKeyPress(key)}
                                className={`${keyBaseClasses} ${regularKeyClasses}`}
                                style={{ gridColumn: 'span 1' }}
                                tabIndex={-1}
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
                        type="button"
                        onMouseDown={handleMouseDown}
                        onClick={handleEnterClick}
                        className={`${keyBaseClasses} ${enterKeyClasses}`}
                        style={{ gridColumn: 'span 1.6' }}
                        tabIndex={-1}
                    >
                        Enter
                    </button>
                </div>

                <div className={rowGridClass}>
                    <button
                        type="button"
                        onMouseDown={handleMouseDown}
                        onClick={handleShift}
                        className={`${keyBaseClasses} ${isShiftPressed ? activeSpecialClasses : specialKeyClasses}`}
                        style={{ gridColumn: 'span 2.4' }}
                        tabIndex={-1}
                    >
                        Shift
                    </button>
                    {['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'].map((key) => {
                        const shiftKey = key === ',' ? '<' : key === '.' ? '>' : key === '/' ? '?' : undefined;
                        return (
                            <button
                                type="button"
                                key={key}
                                onMouseDown={handleMouseDown}
                                onClick={() => handleFullKeyPress(key)}
                                className={`${keyBaseClasses} ${regularKeyClasses}`}
                                style={{ gridColumn: 'span 1' }}
                                tabIndex={-1}
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
                        type="button"
                        onMouseDown={handleMouseDown}
                        onClick={handleShift}
                        className={`${keyBaseClasses} ${isShiftPressed ? activeSpecialClasses : specialKeyClasses}`}
                        style={{ gridColumn: 'span 2.4' }}
                        tabIndex={-1}
                    >
                        Shift
                    </button>
                </div>

                <div className={rowGridClass}>
                    <button
                        type="button"
                        onMouseDown={handleMouseDown}
                        onClick={() => handleFullKeyPress('ctrl')}
                        className={`${keyBaseClasses} ${specialKeyClasses}`}
                        style={{ gridColumn: 'span 1.6' }}
                        tabIndex={-1}
                    >
                        Ctrl
                    </button>
                    <button
                        type="button"
                        onMouseDown={handleMouseDown}
                        onClick={() => handleFullKeyPress('alt')}
                        className={`${keyBaseClasses} ${specialKeyClasses}`}
                        style={{ gridColumn: 'span 1.2' }}
                        tabIndex={-1}
                    >
                        Alt
                    </button>
                    <button
                        type="button"
                        onMouseDown={handleMouseDown}
                        onClick={handleSpaceClick}
                        className={`${keyBaseClasses} ${regularKeyClasses}`}
                        style={{ gridColumn: 'span 7.2' }}
                        tabIndex={-1}
                    >
                        space
                    </button>
                    <button
                        type="button"
                        onMouseDown={handleMouseDown}
                        onClick={() => handleFullKeyPress('alt')}
                        className={`${keyBaseClasses} ${specialKeyClasses}`}
                        style={{ gridColumn: 'span 1.2' }}
                        tabIndex={-1}
                    >
                        Alt
                    </button>
                    <button
                        type="button"
                        onMouseDown={handleMouseDown}
                        onClick={() => handleFullKeyPress('ctrl')}
                        className={`${keyBaseClasses} ${specialKeyClasses}`}
                        style={{ gridColumn: 'span 1.6' }}
                        tabIndex={-1}
                    >
                        Ctrl
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputKeyboard;
