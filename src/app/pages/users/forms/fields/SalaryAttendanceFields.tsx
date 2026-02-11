import type { ChangeEvent, FunctionComponent } from 'react';
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
            <div className="space-y-4">
                <FormInput
                    label="Staff Salary"
                    name="staffSalary"
                    type="number"
                    placeholder="Amount"
                />
                <div className="grid gap-3 grid-cols-2">
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
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={allowSelfAttendance}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                onAllowSelfAttendanceChange(e.target.checked)
                            }
                            className="h-5 w-5 text-sky-500 focus:ring-0 focus:ring-offset-0 border-gray-300 rounded-sm accent-sky-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Allow self attendance
                        </span>
                    </label>

                    {allowSelfAttendance && (
                        <div className="mt-3 flex items-center gap-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="attendanceType"
                                    value="single"
                                    checked={attendanceType === 'single'}
                                    onChange={() => onAttendanceTypeChange('single')}
                                    className="h-4 w-4 text-sky-500 focus:ring-0 focus:ring-offset-0 border-gray-300 accent-sky-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Single</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="attendanceType"
                                    value="punch"
                                    checked={attendanceType === 'punch'}
                                    onChange={() => onAttendanceTypeChange('punch')}
                                    className="h-4 w-4 text-sky-500 focus:ring-0 focus:ring-offset-0 border-gray-300 accent-sky-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Punch In/Out</span>
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </FormFieldCard>
    );
};

export default SalaryAttendanceFields;
