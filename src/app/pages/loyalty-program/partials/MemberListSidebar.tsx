import { FC } from 'react';
import { Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea, Text, IconButton, Badge, Flex } from '@radix-ui/themes';
import * as Avatar from '@radix-ui/react-avatar';
import * as Separator from '@radix-ui/react-separator';
import classNames from 'classnames';
import { SearchBar } from '../../../components/SearchBar';

interface MemberListSidebarProps {
    members: LoyaltyMember[];
    isLoading: boolean;
    searchTerm: string;
    selectedMember: LoyaltyMember | null;
    pageLabel: string;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    onSearchChange: (term: string) => void;
    onSelectMember: (member: LoyaltyMember) => void;
    onNextPage: () => void;
    onPrevPage: () => void;
}

const MemberListSidebar: FC<MemberListSidebarProps> = ({
    members,
    isLoading,
    searchTerm,
    selectedMember,
    pageLabel,
    hasNextPage,
    hasPrevPage,
    onSearchChange,
    onSelectMember,
    onNextPage,
    onPrevPage,
}) => (
    <div className="flex flex-col h-full border-r border-gray-200 dark:border-gray-700">
        {/* Header */}
        <Flex align="center" justify="between" px="3" py="2" className="border-b border-gray-200 dark:border-gray-700">
            <Text size="2" weight="bold">Members</Text>
        </Flex>

        {/* Search */}
        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <SearchBar value={searchTerm} onChange={onSearchChange} placeholder="Search by name or phone..." compact debounce={400} />
        </div>

        {/* List */}
        <ScrollArea scrollbars="vertical" className="flex-1 min-h-0">
            {isLoading && members.length === 0 ? (
                <ListSkeleton />
            ) : members.length === 0 ? (
                <EmptyList searchTerm={searchTerm} />
            ) : (
                members.map((m) => (
                    <MemberItem
                        key={m.loyaltyMemberId}
                        member={m}
                        isSelected={selectedMember?.loyaltyMemberId === m.loyaltyMemberId}
                        onSelect={onSelectMember}
                    />
                ))
            )}
        </ScrollArea>

        {/* Pagination footer */}
        <Separator.Root className="h-px bg-gray-200 dark:bg-gray-700" />
        <Flex align="center" justify="between" px="3" py="2" gap="2">
            <Text size="1" color="gray">{pageLabel}</Text>
            <Flex gap="1">
                <IconButton variant="soft" color="gray" size="1" disabled={!hasPrevPage} onClick={onPrevPage} aria-label="Previous page">
                    <ChevronLeft className="w-3.5 h-3.5" />
                </IconButton>
                <IconButton variant="soft" color="gray" size="1" disabled={!hasNextPage} onClick={onNextPage} aria-label="Next page">
                    <ChevronRight className="w-3.5 h-3.5" />
                </IconButton>
            </Flex>
        </Flex>
    </div>
);

/* ─── List item ──────────────────────────────────────────────────── */

const MemberItem: FC<{
    member: LoyaltyMember;
    isSelected: boolean;
    onSelect: (m: LoyaltyMember) => void;
}> = ({ member, isSelected, onSelect }) => (
    <button
        type="button"
        onClick={() => onSelect(member)}
        className={classNames(
            'w-full text-left px-3 py-2.5 border-b border-gray-100 dark:border-gray-700/50 transition-colors',
            isSelected
                ? 'bg-sky-50 dark:bg-sky-900/20 border-l-2 border-l-sky-500'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-2 border-l-transparent',
        )}
    >
        <Flex align="center" gap="2">
            <Avatar.Root className="flex-shrink-0 w-9 h-9 rounded-lg bg-sky-500 flex items-center justify-center overflow-hidden">
                <Avatar.Fallback className="text-white font-bold text-sm">
                    {member.customer.name.charAt(0).toUpperCase()}
                </Avatar.Fallback>
            </Avatar.Root>
            <div className="min-w-0 flex-1">
                <Flex align="center" gap="1">
                    <Text size="2" weight="medium" truncate>{member.customer.name}</Text>
                    <Badge variant="soft" color="blue" size="1">{member.tier.name}</Badge>
                    {!member.isActive && <Badge variant="soft" color="red" size="1">Inactive</Badge>}
                </Flex>
                <Text size="1" color="gray" truncate className="block">
                    {member.membershipNumber}
                    {member.customer.phone && ` · ${member.customer.phone}`}
                </Text>
            </div>
            <div className="text-right flex-shrink-0">
                <Text size="2" weight="bold" className="text-sky-600 dark:text-sky-400 block">
                    {member.availablePoints.toLocaleString()}
                </Text>
                <Text size="1" color="gray">pts</Text>
            </div>
        </Flex>
    </button>
);

/* ─── Empty / Skeleton ───────────────────────────────────────────── */

const EmptyList: FC<{ searchTerm: string }> = ({ searchTerm }) => (
    <Flex direction="column" align="center" justify="center" py="9" px="4">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <Award className="w-6 h-6 text-gray-400" />
        </div>
        <Text size="2" weight="medium" color="gray">{searchTerm ? 'No members found' : 'No members yet'}</Text>
        <Text size="1" color="gray" align="center" className="mt-1">
            {searchTerm ? 'Try adjusting your search.' : 'Members appear here once customers are enrolled.'}
        </Text>
    </Flex>
);

const ListSkeleton: FC = () => (
    <div className="py-2">
        {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 animate-pulse">
                <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-700/60 rounded w-32" />
                </div>
                <div className="space-y-1">
                    <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-10 ml-auto" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-700/60 rounded w-6 ml-auto" />
                </div>
            </div>
        ))}
    </div>
);

export default MemberListSidebar;
