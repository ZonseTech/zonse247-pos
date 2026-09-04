import { FunctionComponent, useEffect, useState } from 'react';
import branchService from '../services/branch.service';
import SelectField from './SelectField';

interface BranchSelectFieldProps {
    name: string;
    tenantId: string;
    disabled?: boolean;
}

const BranchSelectField: FunctionComponent<BranchSelectFieldProps> = ({ name, tenantId, disabled }) => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!tenantId) {
            setBranches([]);
            return;
        }
        setLoading(true);
        branchService.list({ tenantId })
            .then(setBranches)
            .catch(() => setBranches([]))
            .finally(() => setLoading(false));
    }, [tenantId]);

    return (
        <SelectField
            label="Branch"
            name={name}
            required
            disabled={disabled || !tenantId || loading}
            options={branches.map((branch) => ({ label: branch.branchName, value: branch.branchId }))}
            placeholder={!tenantId ? 'Select tenant first...' : loading ? 'Loading branches...' : 'Select branch...'}
        />
    );
};

export default BranchSelectField;
