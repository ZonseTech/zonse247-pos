import type { FunctionComponent } from 'react';
import { Flex, Text, Switch } from '@radix-ui/themes';
import FormFieldCard from '../../../../components/card/FormFieldCard';

interface StaffOptionsFieldsProps {
    trackAttendance: boolean;
    allowAppAccess: boolean;
    onTrackAttendanceChange: (value: boolean) => void;
    onAllowAppAccessChange: (value: boolean) => void;
}

const StaffOptionsFields: FunctionComponent<StaffOptionsFieldsProps> = ({
    trackAttendance,
    allowAppAccess,
    onTrackAttendanceChange,
    onAllowAppAccessChange,
}) => {
    const handleTrackAttendanceChange = (checked: boolean) => {
        if (!checked && !allowAppAccess) return;
        onTrackAttendanceChange(checked);
    };

    const handleAllowAppAccessChange = (checked: boolean) => {
        if (!checked && !trackAttendance) {
            onTrackAttendanceChange(true);
        }
        onAllowAppAccessChange(checked);
    };

    return (
        <FormFieldCard>
            <Flex direction="column" gap="4">
                <Flex asChild justify="between" align="center" gap="3">
                    <label className="cursor-pointer">
                        <Text size="2" weight="medium">
                            Track staff's attendance and salary
                        </Text>
                        <Switch
                            checked={trackAttendance}
                            onCheckedChange={handleTrackAttendanceChange}
                            color="sky"
                            size="2"
                        />
                    </label>
                </Flex>
                <Flex asChild justify="between" align="center" gap="3">
                    <label className="cursor-pointer">
                        <Text size="2" weight="medium">
                            Allow staff to use the app via roles below?
                        </Text>
                        <Switch
                            checked={allowAppAccess}
                            onCheckedChange={handleAllowAppAccessChange}
                            color="sky"
                            size="2"
                        />
                    </label>
                </Flex>
            </Flex>
        </FormFieldCard>
    );
};

export default StaffOptionsFields;
