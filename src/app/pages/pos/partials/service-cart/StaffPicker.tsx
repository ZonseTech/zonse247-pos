import type { FunctionComponent } from 'react';
import { Select, Avatar, Text, Flex } from '@radix-ui/themes';
import type { StaffPickerProps } from './types';
import { getInitials, getStaffDisplayName } from './utils';

const StaffPicker: FunctionComponent<StaffPickerProps> = ({
    staffList,
    selectedStaffId,
    onChange,
}) => {
    const selected = staffList.find(s => s.staffId === selectedStaffId);

    return (
        <Select.Root value={selectedStaffId} onValueChange={onChange}>
            <Select.Trigger variant="surface" placeholder="Assign">
                {selected && (
                    <Flex align="center" gap="1">
                        <Avatar
                            size="1"
                            radius="full"
                            fallback={getInitials(getStaffDisplayName(selected))}
                            color="cyan"
                        />
                        <Text size="1" truncate>
                            {getStaffDisplayName(selected).split(' ')[0]}
                        </Text>
                    </Flex>
                )}
            </Select.Trigger>
            <Select.Content position="popper" sideOffset={4}>
                {staffList.length === 0 ? (
                    <Select.Item value="" disabled>
                        No staff available
                    </Select.Item>
                ) : (
                    staffList.map(s => {
                        const name = getStaffDisplayName(s);
                        return (
                            <Select.Item key={s.staffId} value={s.staffId}>
                                <Flex align="center" gap="2">
                                    <Avatar
                                        size="1"
                                        radius="full"
                                        fallback={getInitials(name)}
                                        color={s.staffId === selectedStaffId ? 'cyan' : 'gray'}
                                    />
                                    <Text size="1" weight="medium">{name}</Text>
                                </Flex>
                            </Select.Item>
                        );
                    })
                )}
            </Select.Content>
        </Select.Root>
    );
};

export default StaffPicker;
