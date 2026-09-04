import { FunctionComponent, memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import { Monitor, Wifi, WifiOff, CheckCircle, Clock, XCircle, Shield, Ban, Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { Card, CardBody, Badge } from '../../../components';
import { useAuth } from '../../../context/AuthProvider';
import terminalService from '../../../services/terminal.service';
import { ROUTES } from '../../../utils/constants';
import { getErrorMessage } from '../../../utils/api-error-handler';
import TerminalFormModal from '../../terminal/partials/TerminalFormModal';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface TerminalsTabProps {
    terminals: Terminal[];
    branches: Branch[];
    loading: boolean;
    onRefresh: () => void;
}

type BadgeType = 'success' | 'danger' | 'warning' | 'neutral' | 'primary';

const ACTIVATION_BADGE: Record<string, BadgeType> = {
    ACTIVATED: 'success',
    PENDING: 'warning',
    DEACTIVATED: 'neutral',
    SUSPENDED: 'warning',
    BLOCKED: 'danger',
};

const getActivationIcon = (status: TerminalActivationStatus | undefined) => {
    switch (status) {
        case 'ACTIVATED':
            return <CheckCircle className="w-3.5 h-3.5" />;
        case 'PENDING':
            return <Clock className="w-3.5 h-3.5" />;
        case 'BLOCKED':
            return <Ban className="w-3.5 h-3.5" />;
        case 'SUSPENDED':
            return <Shield className="w-3.5 h-3.5" />;
        default:
            return <XCircle className="w-3.5 h-3.5" />;
    }
};

const isRecentlyActive = (lastSeen: string | Date | null | undefined): boolean => {
    if (!lastSeen) return false;
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return new Date(lastSeen).getTime() > fiveMinutesAgo;
};

const AddTerminalCard: FunctionComponent<{ onClick: () => void }> = ({ onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-sky-400 dark:hover:border-sky-500 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-900/10 transition-colors"
    >
        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Plus className="w-4 h-4" />
        </div>
        <span className="text-sm font-semibold">New Terminal</span>
    </button>
);

const TerminalCardSkeleton: FunctionComponent = () => (
    <div className="animate-pulse rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
    </div>
);

const GroupSkeleton: FunctionComponent = () => (
    <div className="animate-pulse rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <TerminalCardSkeleton />
            <TerminalCardSkeleton />
        </div>
    </div>
);

const ActionButton: FunctionComponent<{
    icon: FunctionComponent<{ className?: string }>;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'danger';
}> = ({ icon: Icon, label, onClick, variant = 'default' }) => (
    <button
        type="button"
        onClick={onClick}
        title={label}
        aria-label={label}
        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${variant === 'danger'
            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-sky-500'
            }`}
    >
        <Icon className="w-3.5 h-3.5" />
    </button>
);

const TerminalCard: FunctionComponent<{ terminal: Terminal; onRefresh: () => void }> = ({ terminal, onRefresh }) => {
    const navigate = useNavigate();
    const badge = ACTIVATION_BADGE[terminal.activationStatus || ''] ?? 'neutral';
    const lastSeen = terminal.lastSeenAt || terminal.lastActivity;
    const online = isRecentlyActive(lastSeen);

    const handleEdit = () => {
        navigate(ROUTES.TERMINAL_FORM, { state: { terminalId: terminal.terminalId } });
    };

    const handleDelete = () => {
        Confirm.show(
            'Delete Terminal',
            `Are you sure you want to delete the terminal "${terminal.terminalLabel}"? This action cannot be undone.`,
            'Yes, Delete',
            'Cancel',
            async () => {
                try {
                    await terminalService.delete(terminal.terminalId);
                    Notify.success('Terminal deleted successfully');
                    onRefresh();
                } catch (err) {
                    Notify.failure(getErrorMessage(err, 'Failed to delete terminal'));
                }
            },
            () => { },
            { titleColor: '#ef4444', okButtonBackground: '#ef4444' }
        );
    };

    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 transition-colors hover:border-sky-300 dark:hover:border-sky-700">
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {terminal.terminalLabel}
                        </p>
                        {terminal.isPrimary && <Badge type="warning">Primary</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Code: {terminal.terminalCode}</p>
                </div>
                <Badge type={badge} className="flex items-center gap-1 flex-shrink-0">
                    {getActivationIcon(terminal.activationStatus)}
                    {terminal.activationStatus
                        ? terminal.activationStatus.charAt(0) + terminal.activationStatus.slice(1).toLowerCase()
                        : 'Unknown'}
                </Badge>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span className="truncate">
                    {terminal.osName || 'Unknown OS'}
                    {terminal.osVersion ? ` v${terminal.osVersion}` : ''}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {online ? (
                        <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                        <WifiOff className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <span className={online ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                        {online ? 'Online' : lastSeen ? dayjs(lastSeen).fromNow() : 'Never seen'}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                <ActionButton icon={Pencil} label="Edit terminal" onClick={handleEdit} />
                <ActionButton icon={Trash2} label="Delete terminal" onClick={handleDelete} variant="danger" />
            </div>
        </div>
    );
};

const AccountTerminalsTab: FunctionComponent<TerminalsTabProps> = memo(({ terminals, branches, loading, onRefresh }) => {
    const { user } = useAuth();
    const [showAddModal, setShowAddModal] = useState(false);

    const branchNameById = useMemo(() => {
        const map = new Map<string, string>();
        branches.forEach((b) => map.set(b.branchId, b.branchName));
        return map;
    }, [branches]);

    const groups = useMemo(() => {
        const byBranch = new Map<string, Terminal[]>();
        terminals.forEach((t) => {
            const key = t.branchId || 'unknown';
            if (!byBranch.has(key)) byBranch.set(key, []);
            byBranch.get(key)!.push(t);
        });
        return Array.from(byBranch.entries()).map(([branchId, items]) => ({
            branchId,
            branchName: branchNameById.get(branchId) || 'Unassigned',
            items,
        }));
    }, [terminals, branchNameById]);

    if (loading) {
        return (
            <div className="space-y-4">
                <GroupSkeleton />
                <GroupSkeleton />
            </div>
        );
    }

    if (terminals.length === 0) {
        return (
            <>
                <AddTerminalCard onClick={() => setShowAddModal(true)} />
                <div className="text-center py-12">
                    <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No terminals found</p>
                </div>
                {showAddModal && user?.tenantId && (
                    <TerminalFormModal
                        tenantId={user.tenantId}
                        onClose={() => setShowAddModal(false)}
                        onSaved={onRefresh}
                    />
                )}
            </>
        );
    }

    return (
        <div className="space-y-4">
            <AddTerminalCard onClick={() => setShowAddModal(true)} />
            {groups.map((group) => (
                <Card key={group.branchId}>
                    <CardBody>
                        <div className="flex items-center gap-2 mb-3">
                            <Building2 className="w-4 h-4 text-sky-500" />
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {group.branchName}
                            </h3>
                            <span className="text-xs text-gray-400">({group.items.length})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {group.items.map((terminal) => (
                                <TerminalCard key={terminal.terminalId} terminal={terminal} onRefresh={onRefresh} />
                            ))}
                        </div>
                    </CardBody>
                </Card>
            ))}
            {showAddModal && user?.tenantId && (
                <TerminalFormModal
                    tenantId={user.tenantId}
                    onClose={() => setShowAddModal(false)}
                    onSaved={onRefresh}
                />
            )}
        </div>
    );
});

AccountTerminalsTab.displayName = 'AccountTerminalsTab';

export default AccountTerminalsTab;
