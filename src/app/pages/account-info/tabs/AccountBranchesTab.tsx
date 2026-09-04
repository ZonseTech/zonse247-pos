import { FunctionComponent, memo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import {
    Building2,
    MapPin,
    Mail,
    Phone,
    CheckCircle,
    XCircle,
    AlertCircle,
    Coins,
    Pencil,
    Plus,
    Trash2,
    ArrowRightLeft,
    CreditCard,
} from 'lucide-react';
import { Card, CardBody, Badge } from '../../../components';
import { useAuth } from '../../../context/AuthProvider';
import { useBranch } from '../../../context/BranchContext';
import branchService from '../../../services/branch.service';
import { ROUTES } from '../../../utils/constants';
import { isElectron } from '../../../utils';
import { useBranchPermissions } from '../../../hooks/useBranchPermissions';
import { getErrorMessage } from '../../../utils/api-error-handler';
import { getSubscriptionUrgency, type SubscriptionUrgency } from '../../../utils/subscription';
import BranchFormModal from '../../branch/partials/BranchFormModal';

interface BranchesTabProps {
    branches: Branch[];
    subscriptions: BranchSubscription[];
    loading: boolean;
    onRefresh: () => void;
}

type BadgeType = 'success' | 'danger' | 'warning' | 'neutral' | 'primary';

const STATUS_BADGE: Record<string, BadgeType> = {
    active: 'success',
    inactive: 'neutral',
    suspended: 'danger',
};

const URGENCY_BADGE: Record<SubscriptionUrgency, BadgeType> = {
    ok: 'success',
    warning: 'warning',
    critical: 'danger',
    expired: 'danger',
};

const getMraStatusIcon = (status: MraApprovalStatus | undefined) => {
    switch (status) {
        case 'APPROVED':
            return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
        case 'REJECTED':
            return <XCircle className="w-3.5 h-3.5 text-red-500" />;
        case 'PENDING':
        default:
            return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />;
    }
};

const AddBranchCard: FunctionComponent<{ onClick: () => void }> = ({ onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex flex-col items-center justify-center gap-2 min-h-[180px] w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-sky-400 dark:hover:border-sky-500 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-900/10 transition-colors"
    >
        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Plus className="w-5 h-5" />
        </div>
        <span className="text-sm font-semibold">New Branch</span>
    </button>
);

const BranchCardSkeleton: FunctionComponent = () => (
    <div className="animate-pulse rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            </div>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
    </div>
);

const ActionButton: FunctionComponent<{
    icon: FunctionComponent<{ className?: string }>;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: 'default' | 'danger';
}> = ({ icon: Icon, label, onClick, disabled, variant = 'default' }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={label}
        aria-label={label}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variant === 'danger'
            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-sky-500'
            }`}
    >
        <Icon className="w-4 h-4" />
    </button>
);

const BranchCard: FunctionComponent<{
    branch: Branch;
    subscription?: BranchSubscription;
    onRefresh: () => void;
}> = ({ branch, subscription, onRefresh }) => {
    const navigate = useNavigate();
    const permissions = useBranchPermissions();
    const { currentBranch, switchBranch, hasAccessToBranch } = useBranch();

    const statusBadge = STATUS_BADGE[branch.status] ?? 'neutral';
    const isCurrent = branch.branchId === currentBranch?.branchId;
    const canSwitch = !isElectron() && !isCurrent && branch.status === 'active' && hasAccessToBranch(branch.branchId);
    const { urgency, label: expiryLabel } = getSubscriptionUrgency(subscription);
    const planName = subscription?.subscriptionPlan?.name || subscription?.planName;

    const handleEdit = () => {
        navigate(ROUTES.BRANCH_FORM, { state: { branchId: branch.branchId } });
    };

    const handleDelete = () => {
        Confirm.show(
            'Delete Branch',
            `Are you sure you want to delete the branch "${branch.branchName}"? This action cannot be undone.`,
            'Yes, Delete',
            'Cancel',
            async () => {
                try {
                    await branchService.delete(branch.branchId);
                    Notify.success('Branch deleted successfully');
                    onRefresh();
                } catch (err) {
                    Notify.failure(getErrorMessage(err, 'Failed to delete branch'));
                }
            },
            () => { },
            { titleColor: '#ef4444', okButtonBackground: '#ef4444' }
        );
    };

    const handleSwitch = () => {
        switchBranch(branch.branchId);
    };

    return (
        <Card>
            <CardBody>
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-sky-500" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {branch.branchName}
                                </p>
                                {isCurrent && (
                                    <Badge type="primary" className="flex-shrink-0">Current</Badge>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Code: {branch.branchCode}
                            </p>
                        </div>
                    </div>
                    <Badge type={statusBadge} className="flex-shrink-0">
                        {branch.status?.charAt(0).toUpperCase() + branch.status?.slice(1)}
                    </Badge>
                </div>

                <div className="space-y-2 text-sm">
                    {branch.email && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{branch.email}</span>
                        </div>
                    )}
                    {branch.phoneNumber && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{branch.phoneNumber}</span>
                        </div>
                    )}
                    {(branch.city || branch.addressLine1) && (
                        <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <span className="min-w-0">
                                {branch.city && <span className="block truncate">{branch.city}</span>}
                                {branch.addressLine1 && (
                                    <span className="block text-xs text-gray-500 dark:text-gray-500 truncate">
                                        {branch.addressLine1}
                                    </span>
                                )}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Coins className="w-3.5 h-3.5" />
                        {branch.currencySymbol} ({branch.currencyCode})
                    </div>
                    <div className="flex items-center gap-1.5">
                        {getMraStatusIcon(branch.mraApprovalStatus)}
                        <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                            {branch.mraApprovalStatus?.toLowerCase() || 'pending'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 min-w-0">
                        <CreditCard className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{planName || 'No subscription'}</span>
                    </div>
                    {urgency && (
                        <Badge type={URGENCY_BADGE[urgency]} className="flex-shrink-0">
                            {expiryLabel}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                    {canSwitch && (
                        <ActionButton icon={ArrowRightLeft} label="Switch to this branch" onClick={handleSwitch} />
                    )}
                    {permissions.canEditBranch(branch.branchId) && (
                        <ActionButton icon={Pencil} label="Edit branch" onClick={handleEdit} />
                    )}
                    {permissions.canDeleteBranch(branch.branchId) && (
                        <ActionButton icon={Trash2} label="Delete branch" onClick={handleDelete} variant="danger" />
                    )}
                </div>
            </CardBody>
        </Card>
    );
};

const AccountBranchesTab: FunctionComponent<BranchesTabProps> = memo(({ branches, subscriptions, loading, onRefresh }) => {
    const { user } = useAuth();
    const permissions = useBranchPermissions();
    const [showAddModal, setShowAddModal] = useState(false);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <BranchCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (branches.length === 0) {
        return (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {permissions.canCreateBranch && (
                        <AddBranchCard onClick={() => setShowAddModal(true)} />
                    )}
                </div>
                {!permissions.canCreateBranch && (
                    <div className="text-center py-12">
                        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No branches found</p>
                    </div>
                )}
                {showAddModal && user?.tenantId && (
                    <BranchFormModal
                        tenantId={user.tenantId}
                        onClose={() => setShowAddModal(false)}
                        onSaved={onRefresh}
                    />
                )}
            </>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissions.canCreateBranch && (
                    <AddBranchCard onClick={() => setShowAddModal(true)} />
                )}
                {branches.map((branch) => (
                    <BranchCard
                        key={branch.branchId}
                        branch={branch}
                        subscription={subscriptions.find(
                            (sub) =>
                                sub.branchId === branch.branchId ||
                                sub.branch?.branchId === branch.branchId ||
                                sub.branchSubscriptionId === branch.branchSubscriptionId,
                        )}
                        onRefresh={onRefresh}
                    />
                ))}
            </div>
            {showAddModal && user?.tenantId && (
                <BranchFormModal
                    tenantId={user.tenantId}
                    onClose={() => setShowAddModal(false)}
                    onSaved={onRefresh}
                />
            )}
        </>
    );
});

AccountBranchesTab.displayName = 'AccountBranchesTab';

export default AccountBranchesTab;
