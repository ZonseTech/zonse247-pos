import { FC, useCallback, useEffect, useState } from 'react';
import { Notify } from 'notiflix';
import { ArrowLeft } from 'lucide-react';
import { Box, IconButton } from '@radix-ui/themes';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import loyaltyService from '../../../services/loyalty.service';
import MemberListSidebar from './MemberListSidebar';
import MemberActivityPanel from './MemberActivityPanel';

const PER_PAGE = 20;

interface MembersListProps {
    program: LoyaltyProgram;
}

const MembersList: FC<MembersListProps> = ({ program }) => {
    const isMobile = useIsMobile();
    const [members, setMembers] = useState<LoyaltyMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState<LoyaltyMember | null>(null);
    const [showActivity, setShowActivity] = useState(false);

    const loadMembers = useCallback(async (p: number, q?: string) => {
        setIsLoading(true);
        try {
            const query: Record<string, any> = { page: p, limit: PER_PAGE };
            if (q) query.search = q;
            const result = await loyaltyService.listMembers(program.loyaltyProgramId, query);
            setMembers(result.members);
            setPage(result.pagination.page);
            setTotalPages(result.pagination.totalPages);
            setTotal(result.pagination.total);
        } catch {
            Notify.failure('Failed to load members');
        } finally {
            setIsLoading(false);
        }
    }, [program.loyaltyProgramId]);

    useEffect(() => { loadMembers(1); }, [loadMembers]);

    const handleSearchChange = useCallback((term: string) => {
        setSearch(term);
        loadMembers(1, term);
    }, [loadMembers]);

    const handleSelectMember = useCallback((member: LoyaltyMember) => {
        setSelectedMember(member);
        if (isMobile) setShowActivity(true);
    }, [isMobile]);

    const handleMemberUpdated = useCallback(() => {
        loadMembers(page, search);
    }, [loadMembers, page, search]);

    const pageLabel = `${total} member${total !== 1 ? 's' : ''}`;

    const sidebarProps = {
        members,
        isLoading,
        searchTerm: search,
        selectedMember,
        pageLabel,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        onSearchChange: handleSearchChange,
        onSelectMember: handleSelectMember,
        onNextPage: () => loadMembers(page + 1, search),
        onPrevPage: () => loadMembers(page - 1, search),
    };

    const activityProps = {
        member: selectedMember,
        onMemberUpdated: handleMemberUpdated,
    };

    return (
        <Box className="sm:rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 sm:overflow-clip flex-1 min-h-0 flex flex-col">
            {isMobile ? (
                showActivity ? (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                            <IconButton variant="ghost" color="gray" size="1" onClick={() => setShowActivity(false)}>
                                <ArrowLeft className="w-4 h-4" />
                            </IconButton>
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                {selectedMember?.customer.name}
                            </span>
                        </div>
                        <MemberActivityPanel {...activityProps} />
                    </div>
                ) : (
                    <MemberListSidebar {...sidebarProps} />
                )
            ) : (
                <div className="flex h-full min-h-[500px]">
                    <div className="w-1/3 min-w-[280px] max-w-[360px] flex-shrink-0">
                        <MemberListSidebar {...sidebarProps} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <MemberActivityPanel {...activityProps} />
                    </div>
                </div>
            )}
        </Box>
    );
};

export default MembersList;
