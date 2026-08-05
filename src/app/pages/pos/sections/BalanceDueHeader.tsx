import { FunctionComponent } from 'react';
import Panel from '../../../components/Panel';
import classNames from 'classnames';
import type { POSLayoutConfig } from '../hooks/usePOSLayout';

interface BalanceDueHeaderProps {
    layout: POSLayoutConfig;
    total: number;
    subtotal: number;
    discount: number;
}

const BalanceDueHeader: FunctionComponent<BalanceDueHeaderProps> = ({
    layout,
    total,
    subtotal,
    discount,
}) => {
    const { compact, mode } = layout;
    const isService = mode === 'service';

    return (
        <div className={classNames(
            "flex-shrink-0",
            compact ? "mb-1" : isService ? "mb-1 lg:mb-2" : "mb-2 lg:mb-3"
        )} data-pos-guide="balance-due">
            <div className="flex items-center justify-between">
                <Panel size={layout.header.label}>
                    <h1 className={classNames(
                        "uppercase tracking-wider font-bold text-black dark:text-gray-400",
                        compact
                            ? "text-xl"
                            : isService
                                ? "text-2xl lg:text-4xl"
                                : "text-5xl lg:text-7xl"
                    )}>
                        BALANCE DUE
                    </h1>
                    {discount > 0 && (
                        <div className={classNames(
                            "flex items-center gap-2 mt-1",
                            compact ? "text-xs" : isService ? "text-xs lg:text-sm" : "text-sm lg:text-base"
                        )}>
                            <span className="text-gray-500 dark:text-gray-400">
                                Subtotal: MK {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-green-500 dark:text-green-400 font-semibold">
                                Discount: -MK {discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    )}
                </Panel>
                <Panel size={layout.header.total} className={classNames(
                    "bg-gray-800 text-green-400/95 text-center font-bold mt-2",
                    compact
                        ? "px-2 py-1.5 text-xl"
                        : isService
                            ? "px-3 lg:px-4 py-2 lg:py-3 text-2xl lg:text-3xl"
                            : "px-4 lg:px-8 py-3 lg:py-4 text-4xl lg:text-6xl"
                )}>
                    MK {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Panel>
            </div>
        </div>
    );
};

export default BalanceDueHeader;
