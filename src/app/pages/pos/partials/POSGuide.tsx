import { FunctionComponent, useEffect, useState } from 'react';
import { Joyride, STATUS, type Step } from 'react-joyride';
import { CircleHelp } from 'lucide-react';
import useLocalStorage from '../../../hooks/useLocalStorage';

interface POSGuideProps {
    steps: Step[];
    storageKey: string;
    placement?: 'floating' | 'inline';
    buttonClassName?: string;
    buttonLabel?: string;
}

const JOYRIDE_STYLES = {
    options: {
        primaryColor: '#0ea5e9',
        textColor: '#0f172a',
        overlayColor: 'rgba(15, 23, 42, 0.55)',
        zIndex: 80,
    },
    tooltipContainer: {
        textAlign: 'left' as const,
    },
};

const POSGuide: FunctionComponent<POSGuideProps> = ({
    steps,
    storageKey,
    placement = 'floating',
    buttonClassName = '',
    buttonLabel = 'POS Guide',
}) => {
    const [hasSeenGuide, setHasSeenGuide] = useLocalStorage<boolean>(storageKey, false);
    const [run, setRun] = useState(false);

    useEffect(() => {
        if (hasSeenGuide || steps.length === 0) return;

        const timer = window.setTimeout(() => {
            setRun(true);
        }, 700);

        return () => window.clearTimeout(timer);
    }, [hasSeenGuide, steps.length]);

    const openGuide = () => {
        if (steps.length === 0) return;
        setRun(true);
    };

    const handleJoyrideEvent = (data: any) => {
        if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
            setRun(false);
            setHasSeenGuide(true);
        }
    };

    const trigger = (
        <button
            type="button"
            onClick={openGuide}
            aria-label={buttonLabel}
            className={[
                'inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/90 px-3 py-2 text-sky-700 shadow-sm transition-colors hover:bg-sky-50 hover:text-sky-800 dark:border-sky-800 dark:bg-gray-900/90 dark:text-sky-300 dark:hover:bg-gray-800',
                buttonClassName,
            ].filter(Boolean).join(' ')}
        >
            <CircleHelp className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-semibold">{buttonLabel}</span>
        </button>
    );

    return (
        <>
            <Joyride
                steps={steps}
                run={run}
                continuous
                scrollToFirstStep
                onEvent={handleJoyrideEvent}
                styles={JOYRIDE_STYLES}
                locale={{ back: 'Back', close: 'Close', last: 'Done', next: 'Next', skip: 'Skip' }}
            />

            {placement === 'floating' ? (
                <div className="fixed right-4 top-4 z-[70]">
                    {trigger}
                </div>
            ) : trigger}
        </>
    );
};

export default POSGuide;