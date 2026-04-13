import { FC } from 'react';
import { Pencil, Trash2, Clock, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import { MobilePagination } from '../../../components';

const PRICING_COLORS: Record<string, string> = {
    FIXED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    HOURLY: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    PER_UNIT: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    PACKAGE: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    FLAT_RATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    VARIABLE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    TIERED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    SUBSCRIPTION: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    CUSTOM: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const PRICING_LABELS: Record<string, string> = {
    FIXED: 'Fixed',
    HOURLY: 'Hourly',
    PER_UNIT: 'Per Unit',
    PACKAGE: 'Package',
    FLAT_RATE: 'Flat Rate',
    VARIABLE: 'Variable',
    TIERED: 'Tiered',
    SUBSCRIPTION: 'Subscription',
    CUSTOM: 'Custom',
};

interface Props {
    services: Service[];
    onEdit: (service: Service) => void;
    onDelete: (service: Service) => void;
    onToggleStatus?: (service: Service) => void;
    isLoading?: boolean;
}

const ServiceCard: FC<{
    service: Service;
    onEdit: (s: Service) => void;
    onDelete: (s: Service) => void;
    onToggleStatus?: (s: Service) => void;
}> = ({ service, onEdit, onDelete, onToggleStatus }) => (
    <div
        className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 active:bg-gray-50 dark:active:bg-gray-700/50 transition-colors"
        onClick={() => onEdit(service)}
    >
        <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
                {/* Title row */}
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{service.name}</h3>
                    <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full shrink-0 ${service.isActive
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                    >
                        <span className={`w-1 h-1 rounded-full ${service.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {service.category && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Tag className="w-3 h-3" />
                            {service.category.name}
                        </span>
                    )}
                    <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded-full ${PRICING_COLORS[service.pricingType] || PRICING_COLORS.CUSTOM}`}>
                        {PRICING_LABELS[service.pricingType] || service.pricingType}
                    </span>
                    {service.durationMin != null && service.durationMin > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            {service.durationMin >= 60
                                ? `${Math.floor(service.durationMin / 60)}h ${service.durationMin % 60 ? `${service.durationMin % 60}m` : ''}`
                                : `${service.durationMin}m`}
                        </span>
                    )}
                    {service.sku && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{service.sku}</span>
                    )}
                </div>

                {/* Price */}
                {service.basePrice != null && (
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1.5">
                        MK {Number(service.basePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        {service.pricingType === 'HOURLY' && <span className="text-xs font-normal text-gray-400">/hr</span>}
                        {service.pricingType === 'PER_UNIT' && <span className="text-xs font-normal text-gray-400">/unit</span>}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={() => onEdit(service)}
                    className="p-2 text-sky-500 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                    title="Edit"
                >
                    <Pencil className="w-4 h-4" />
                </button>
                {onToggleStatus && (
                    <button
                        onClick={() => onToggleStatus(service)}
                        className={`p-2 rounded-lg transition-colors ${service.isActive
                                ? 'text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                : 'text-green-500 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                        title={service.isActive ? 'Deactivate' : 'Activate'}
                    >
                        {service.isActive ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                    </button>
                )}
                <button
                    onClick={() => onDelete(service)}
                    className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
);

export const ServiceMobileList: FC<Props> = ({ services, onEdit, onDelete, onToggleStatus, isLoading }) => {
    if (isLoading) {
        return (
            <div className="space-y-0">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 animate-pulse">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-1.5" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                            </div>
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (services.length === 0) {
        return (
            <div className="py-12 text-center">
                <p className="text-gray-400 dark:text-gray-500 text-sm">No services found</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 overflow-hidden">
            {services.map((svc) => (
                <ServiceCard
                    key={svc.id}
                    service={svc}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                />
            ))}
        </div>
    );
};
