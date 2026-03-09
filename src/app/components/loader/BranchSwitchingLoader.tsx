import { FunctionComponent, useEffect, useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Building2, ArrowRight, Check } from 'lucide-react';
import { Logo } from '../../assets/images';
import { ThemeContext } from '../../context/ThemeContext';
import classNames from 'classnames';

export interface BranchSwitchingLoaderProps {
    isVisible: boolean;
    fromBranch?: Branch | null;
    toBranch?: Branch | null;
    onComplete?: () => void;
}

type AnimationPhase = 'entering' | 'fromBranch' | 'transitioning' | 'toBranch' | 'complete' | 'exiting';

const BranchSwitchingLoader: FunctionComponent<BranchSwitchingLoaderProps> = ({
    isVisible,
    fromBranch,
    toBranch,
    onComplete
}) => {
    const [phase, setPhase] = useState<AnimationPhase>('entering');
    const [showLoader, setShowLoader] = useState(false);
    const { mode } = useContext(ThemeContext);
    const isDark = mode === 'dark';

    useEffect(() => {
        if (isVisible) {
            setShowLoader(true);
            setPhase('entering');

            // Animation sequence
            const timers = [
                setTimeout(() => setPhase('fromBranch'), 100),
                setTimeout(() => setPhase('transitioning'), 800),
                setTimeout(() => setPhase('toBranch'), 1600),
                setTimeout(() => setPhase('complete'), 2400),
                setTimeout(() => {
                    setPhase('exiting');
                    onComplete?.();
                }, 3000),
            ];

            return () => timers.forEach(clearTimeout);
        } else {
            const timer = setTimeout(() => setShowLoader(false), 400);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onComplete]);

    if (!showLoader) return null;

    const content = (
        <div
            className={classNames(
                "fixed inset-0 z-[99999] flex items-center justify-center",
                "transition-opacity duration-300",
                isDark
                    ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
                    : "bg-gradient-to-br from-white via-gray-50 to-white",
                phase === 'exiting' ? 'opacity-0' : 'opacity-100'
            )}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className={classNames(
                    "absolute inset-0",
                    isDark
                        ? "bg-[radial-gradient(circle_at_30%_-20%,rgba(14,165,233,0.15),transparent_50%)]"
                        : "bg-[radial-gradient(circle_at_30%_-20%,rgba(14,165,233,0.1),transparent_50%)]"
                )} />
                <div className={classNames(
                    "absolute inset-0",
                    isDark
                        ? "bg-[radial-gradient(circle_at_70%_120%,rgba(14,165,233,0.1),transparent_50%)]"
                        : "bg-[radial-gradient(circle_at_70%_120%,rgba(14,165,233,0.08),transparent_50%)]"
                )} />
                {/* Animated circles */}
                <div className={classNames(
                    "absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse",
                    isDark ? "bg-sky-500/5" : "bg-sky-500/10"
                )} />
                <div className={classNames(
                    "absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse delay-500",
                    isDark ? "bg-sky-500/5" : "bg-sky-500/10"
                )} />
            </div>

            {/* Main Content */}
            <div className="relative flex flex-col items-center px-8 max-w-lg">
                {/* Logo */}
                <div className={classNames(
                    "mb-8 transition-all duration-500",
                    phase === 'entering' ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
                )}>
                    <div className="relative">
                        <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-xl animate-pulse" />
                        <img
                            src={Logo}
                            alt="Logo"
                            className="relative w-20 h-20 rounded-2xl shadow-2xl shadow-sky-500/20"
                        />
                    </div>
                </div>

                {/* Title */}
                <h2 className={classNames(
                    "text-xl font-semibold mb-8 transition-all duration-500",
                    isDark ? "text-white" : "text-gray-900",
                    phase === 'entering' ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
                )}>
                    Switching Branch
                </h2>

                {/* Branch Cards Container */}
                <div className="flex items-center gap-4 mb-8">
                    {/* From Branch */}
                    <div className={classNames(
                        "relative flex flex-col items-center p-4 rounded-2xl transition-all duration-500",
                        "backdrop-blur-sm",
                        isDark
                            ? "bg-white/5 border border-white/10"
                            : "bg-gray-100 border border-gray-200",
                        "min-w-[140px]",
                        phase === 'entering' ? 'translate-x-8 opacity-0 scale-90' :
                            phase === 'fromBranch' ? 'translate-x-0 opacity-100 scale-100 ring-2 ring-sky-500/50' :
                                phase === 'transitioning' ? 'translate-x-0 opacity-50 scale-95' :
                                    'translate-x-0 opacity-30 scale-90'
                    )}>
                        <div className={classNames(
                            "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300",
                            phase === 'fromBranch' ? 'bg-sky-500/20' : isDark ? 'bg-white/10' : 'bg-gray-200'
                        )}>
                            <Building2 className={classNames(
                                "w-6 h-6 transition-colors duration-300",
                                phase === 'fromBranch' ? 'text-sky-400' : isDark ? 'text-white/60' : 'text-gray-500'
                            )} />
                        </div>
                        <span className={classNames(
                            "text-sm font-medium text-center line-clamp-2",
                            isDark ? "text-white/80" : "text-gray-700"
                        )}>
                            {fromBranch?.branchName || 'Current'}
                        </span>
                        {phase === 'fromBranch' && (
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-sky-500 rounded-full" />
                        )}
                    </div>

                    {/* Arrow Animation */}
                    <div className={classNames(
                        "flex items-center transition-all duration-500",
                        phase === 'transitioning' || phase === 'toBranch' || phase === 'complete'
                            ? 'opacity-100' : 'opacity-30'
                    )}>
                        <div className="relative flex items-center">
                            {/* Animated dots */}
                            <div className={classNames(
                                "flex gap-1 transition-all duration-300",
                                phase === 'transitioning' ? 'opacity-100' : 'opacity-0'
                            )}>
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"
                                        style={{ animationDelay: `${i * 150}ms` }}
                                    />
                                ))}
                            </div>
                            {/* Arrow */}
                            <ArrowRight className={classNames(
                                "w-6 h-6 text-sky-400 absolute left-0 transition-all duration-500",
                                phase === 'toBranch' || phase === 'complete'
                                    ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                            )} />
                        </div>
                    </div>

                    {/* To Branch */}
                    <div className={classNames(
                        "relative flex flex-col items-center p-4 rounded-2xl transition-all duration-500",
                        "backdrop-blur-sm",
                        isDark
                            ? "bg-white/5 border border-white/10"
                            : "bg-gray-100 border border-gray-200",
                        "min-w-[140px]",
                        phase === 'entering' ? '-translate-x-8 opacity-0 scale-90' :
                            phase === 'fromBranch' ? 'translate-x-0 opacity-50 scale-95' :
                                phase === 'transitioning' ? 'translate-x-0 opacity-75 scale-100' :
                                    phase === 'toBranch' || phase === 'complete' ? 'translate-x-0 opacity-100 scale-100 ring-2 ring-emerald-500/50' :
                                        'translate-x-0 opacity-100 scale-100'
                    )}>
                        <div className={classNames(
                            "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300",
                            phase === 'toBranch' || phase === 'complete' ? 'bg-emerald-500/20' : isDark ? 'bg-white/10' : 'bg-gray-200'
                        )}>
                            {phase === 'complete' ? (
                                <Check className="w-6 h-6 text-emerald-400 animate-[scaleIn_0.3s_ease-out]" />
                            ) : (
                                <Building2 className={classNames(
                                    "w-6 h-6 transition-colors duration-300",
                                    phase === 'toBranch' ? 'text-emerald-400' : isDark ? 'text-white/60' : 'text-gray-500'
                                )} />
                            )}
                        </div>
                        <span className={classNames(
                            "text-sm font-medium text-center line-clamp-2 transition-colors duration-300",
                            phase === 'toBranch' || phase === 'complete'
                                ? isDark ? 'text-white' : 'text-gray-900'
                                : isDark ? 'text-white/60' : 'text-gray-500'
                        )}>
                            {toBranch?.branchName || 'New Branch'}
                        </span>
                        {(phase === 'toBranch' || phase === 'complete') && (
                            <div className={classNames(
                                "absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full transition-colors duration-300",
                                phase === 'complete' ? 'bg-emerald-500' : 'bg-sky-500'
                            )} />
                        )}
                    </div>
                </div>

                {/* Status Text */}
                <div className="h-6 flex items-center justify-center">
                    <p className={classNames(
                        "text-sm transition-all duration-300",
                        phase === 'complete' ? 'text-emerald-500' : isDark ? 'text-white/60' : 'text-gray-500'
                    )}>
                        {phase === 'entering' || phase === 'fromBranch' ? 'Preparing branch switch...' :
                            phase === 'transitioning' ? 'Loading products & settings...' :
                                phase === 'toBranch' ? 'Setting up branch data...' :
                                    phase === 'complete' ? 'Branch switch complete!' :
                                        'Redirecting...'}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className={classNames(
                    "w-64 h-1 rounded-full mt-6 overflow-hidden",
                    isDark ? "bg-white/10" : "bg-gray-200"
                )}>
                    <div
                        className={classNames(
                            "h-full rounded-full transition-all duration-700 ease-out",
                            phase === 'complete' || phase === 'exiting'
                                ? 'bg-emerald-500'
                                : 'bg-gradient-to-r from-sky-500 to-sky-400'
                        )}
                        style={{
                            width: phase === 'entering' ? '0%' :
                                phase === 'fromBranch' ? '25%' :
                                    phase === 'transitioning' ? '60%' :
                                        phase === 'toBranch' ? '85%' :
                                            '100%'
                        }}
                    />
                </div>

                {/* Loading Spinner (subtle) */}
                {phase !== 'complete' && phase !== 'exiting' && (
                    <div className={classNames(
                        "absolute bottom-8 flex items-center gap-2",
                        isDark ? "text-white/40" : "text-gray-400"
                    )}>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(content, document.body);
};

export default BranchSwitchingLoader;
