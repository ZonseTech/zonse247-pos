import type { FunctionComponent } from 'react';
import { Flex, Box, Text } from '@radix-ui/themes';
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
            <Flex direction="column" gap="4">
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
                <Box>
                    <Text as="label" size="2" weight="medium" mb="1" className="block">
                        Role <Text color="red" asChild><span>*</span></Text>
                    </Text>
                    <RoleSearch
                        selectedRoleId={roleId}
                        onRoleSelect={(role) => {
                            onRoleChange(role?.roleId || '');
                        }}
                        tenantId={tenantId}
                        disabled={!tenantId}
                    />
                    {roleTouched && roleError && typeof roleError === 'string' && (
                        <Text as="p" size="1" color="red" mt="1">{roleError}</Text>
                    )}
                </Box>
            </Flex>
        </FormFieldCard>
    );
};

export default BranchRoleFields;
