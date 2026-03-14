import type { FunctionComponent } from 'react';
import FormFieldCard from '../../../../components/card/FormFieldCard';
import BranchSearch from '../../../terminal/partials/BranchSearch';
import TenantSearch from '../../../branch/partials/TenantSearch';
import { RoleSearch } from '../../partials/RoleSearch';

interface BranchRoleFieldsProps {
    branchId: string;
    roleId: string;
    tenantId: string;
    branchError?: string;
    branchTouched?: boolean;
    roleError?: string;
    roleTouched?: boolean;
    onBranchChange: (branchId: string) => void;
    onRoleChange: (roleId: string) => void;
    showTenant?: boolean;
    tenantDisabled?: boolean;
    onTenantChange?: (tenantId: string) => void;
}

const BranchRoleFields: FunctionComponent<BranchRoleFieldsProps> = ({
    branchId,
    roleId,
    tenantId,
    branchError,
    branchTouched,
    roleError,
    roleTouched,
    onBranchChange,
    onRoleChange,
    showTenant = false,
    tenantDisabled = false,
    onTenantChange,
}) => {
    return (
        <FormFieldCard>
            <div className="space-y-4">
                {showTenant && onTenantChange && (
                    <TenantSearch
                        value={tenantId}
                        onChange={onTenantChange}
                        disabled={tenantDisabled}
                    />
                )}
                <BranchSearch
                    value={branchId}
                    onChange={onBranchChange}
                    tenantId={tenantId}
                    error={branchError}
                    touched={branchTouched}
                />
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role <span className="text-red-500">*</span>
                    </label>
                    <RoleSearch
                        selectedRoleId={roleId}
                        onRoleSelect={(role) => {
                            onRoleChange(role?.roleId || '');
                        }}
                        tenantId={tenantId}
                        disabled={!tenantId}
                    />
                    {roleTouched && roleError && typeof roleError === 'string' && (
                        <div className="text-red-500 text-sm mt-1">{roleError}</div>
                    )}
                </div>
            </div>
        </FormFieldCard>
    );
};

export default BranchRoleFields;
