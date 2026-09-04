import { ZonseThemeContext } from '../../../../components';
import { getTableStyles } from '../../../../utils/table-styles';
import DataTable, { TableColumn } from 'react-data-table-component';
import { FunctionComponent, memo, useContext } from 'react';
import TableSkeleton from '../../../../components/skeleton/TableSkeleton';
import { Building2, MapPin, Mail, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge, Box, Flex, Text } from '@radix-ui/themes';

interface BranchesTabProps {
    branches: Branch[];
    loading: boolean;
    tenantId?: string;
    onRefresh?: () => void;
}

const branchStatusColorMap: Record<string, 'green' | 'gray' | 'red'> = {
    active: 'green',
    inactive: 'gray',
    suspended: 'red',
};

const getMraStatusIcon = (status: MraApprovalStatus | undefined) => {
    switch (status) {
        case 'APPROVED':
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        case 'REJECTED':
            return <XCircle className="w-4 h-4 text-red-500" />;
        case 'PENDING':
        default:
            return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
};

const getBranchColumns = (): TableColumn<Branch>[] => [
    {
        name: 'Branch',
        cell: (row) => (
            <Box py="2">
                <Text as="p" size="2" weight="medium" className="truncate">{row.branchName}</Text>
                <Text as="p" size="1" color="gray">Code: {row.branchCode}</Text>
            </Box>
        ),
        sortable: true,
        sortField: 'branchName',
    },
    {
        name: 'Contact',
        cell: (row) => (
            <Box py="2">
                {row.email && (
                    <Flex align="center" gap="1" mb="1">
                        <Mail className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        <Text size="2" color="gray" className="truncate">{row.email}</Text>
                    </Flex>
                )}
                {row.phoneNumber && (
                    <Flex align="center" gap="1">
                        <Phone className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        <Text size="2" color="gray">{row.phoneNumber}</Text>
                    </Flex>
                )}
            </Box>
        ),
    },
    {
        name: 'Location',
        cell: (row) => (
            <Flex align="start" gap="1" py="2">
                <MapPin className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                <Box>
                    {row.city && <Text as="p" size="2" color="gray" className="truncate">{row.city}</Text>}
                    {row.addressLine1 && (
                        <Text as="p" size="1" color="gray" className="truncate">{row.addressLine1}</Text>
                    )}
                </Box>
            </Flex>
        ),
    },
    {
        name: 'Currency',
        cell: (row) => (
            <Text size="2">{row.currencySymbol} ({row.currencyCode})</Text>
        ),
        center: true,
    },
    {
        name: 'MRA Status',
        cell: (row) => (
            <Flex align="center" gap="1">
                {getMraStatusIcon(row.mraApprovalStatus)}
                <Text size="1" color="gray" className="capitalize">
                    {row.mraApprovalStatus?.toLowerCase() || 'pending'}
                </Text>
            </Flex>
        ),
        center: true,
    },
    {
        name: 'Status',
        cell: (row) => (
            <Badge variant="soft" radius="full" color={branchStatusColorMap[row.status || ''] || 'gray'}>
                {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
            </Badge>
        ),
        width: '100px',
        center: true,
    },
];

const BranchesTab: FunctionComponent<BranchesTabProps> = memo(({ branches, loading, tenantId, onRefresh }) => {
    const { mode } = useContext(ZonseThemeContext);

    if (loading) {
        return <TableSkeleton rows={5} columns={5} showCheckbox={false} showActions={false} />;
    }

    return (
        <DataTable
            columns={getBranchColumns()}
            data={branches}
            theme={mode as string}
            highlightOnHover
            striped
            responsive
            noDataComponent={
                <Flex direction="column" align="center" py="8">
                    <Building2 className="w-12 h-12 text-gray-400 mb-4" />
                    <Text color="gray">No branches found for this tenant</Text>
                </Flex>
            }
            customStyles={getTableStyles(mode)}
        />
    );
});

BranchesTab.displayName = 'BranchesTab';

export default BranchesTab;
