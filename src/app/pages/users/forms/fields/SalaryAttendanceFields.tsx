import type { FunctionComponent } from 'react';
import { Flex, Grid, Text, Switch, Separator, SegmentedControl } from '@radix-ui/themes';
import FormFieldCard from '../../../../components/card/FormFieldCard';
import FormInput from '../../../../components/FormInput';

type AttendanceType = 'single' | 'punch';

interface SalaryAttendanceFieldsProps {
    calculateAs: string;
    allowSelfAttendance: boolean;
    attendanceType: string;
    onAllowSelfAttendanceChange: (value: boolean) => void;
    onAttendanceTypeChange: (value: AttendanceType) => void;
}

const SalaryAttendanceFields: FunctionComponent<SalaryAttendanceFieldsProps> = ({
    calculateAs,
    allowSelfAttendance,
    attendanceType,
    onAllowSelfAttendanceChange,
    onAttendanceTypeChange,
}) => {
    return (
        <FormFieldCard>
            <Flex direction="column" gap="4">
                <FormInput
                    label="Staff Salary"
                    name="staffSalary"
                    type="number"
                    placeholder="Amount"
                />
                <Grid columns="2" gap="3">
                    {calculateAs !== 'hourly' && (
                        <FormInput
                            label="Avg. Shift Hrs/Day"
                            name="avgShiftHours"
                            type="number"
                            placeholder="e.g., 8"
                            min={1}
                            max={24}
                        />
                    )}
                    <FormInput
                        label="Joining Date"
                        name="joiningDate"
                        type="date"
                    />
                </Grid>

                <Separator size="4" />

                <Flex asChild justify="between" align="center" gap="3">
                    <label className="cursor-pointer">
                        <Text size="2" weight="medium">
                            Allow self attendance
                        </Text>
                        <Switch
                            checked={allowSelfAttendance}
                            onCheckedChange={onAllowSelfAttendanceChange}

                            size="2"
                        />
                    </label>
                </Flex>

                {allowSelfAttendance && (
                    <SegmentedControl.Root
                        value={attendanceType}
                        onValueChange={(val) => onAttendanceTypeChange(val as AttendanceType)}
                        size="2"
                    >
                        <SegmentedControl.Item value="single">Single</SegmentedControl.Item>
                        <SegmentedControl.Item value="punch">Punch In/Out</SegmentedControl.Item>
                    </SegmentedControl.Root>
                )}
            </Flex>
        </FormFieldCard>
    );
};

export default SalaryAttendanceFields;
