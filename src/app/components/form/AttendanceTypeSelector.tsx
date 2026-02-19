import type { FunctionComponent, ChangeEvent } from 'react';

type AttendanceType = 'single' | 'punch';

interface AttendanceTypeSelectorProps {
    allowSelfAttendance: boolean;
    attendanceType: string;
    onAllowSelfAttendanceChange: (checked: boolean) => void;
    onAttendanceTypeChange: (type: AttendanceType) => void;
    accentColor?: string;
}

const AttendanceTypeSelector: FunctionComponent<AttendanceTypeSelectorProps> = ({
    allowSelfAttendance,
    attendanceType,
    onAllowSelfAttendanceChange,
    onAttendanceTypeChange,
    accentColor = 'emerald'
}) => {
    const accentClasses: Record<string, string> = {
        sky: 'accent-sky-500 text-sky-500',
        emerald: 'accent-emerald-500 text-emerald-500',
        purple: 'accent-purple-500 text-purple-500',
        amber: 'accent-amber-500 text-amber-500',
    };

    const checkboxClass = accentClasses[accentColor] || accentClasses.emerald;

    return (
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <label className="flex items-center space-x-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={allowSelfAttendance}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onAllowSelfAttendanceChange(e.target.checked)}
                    className={`h-5 w-5 focus:ring-0 focus:ring-offset-0 border-gray-300 rounded ${checkboxClass}`}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Allow self attendance
                </span>
            </label>

            {allowSelfAttendance && (
                <div className="mt-3 ml-8 flex items-center gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="radio"
                            name="attendanceType"
                            checked={attendanceType === 'single'}
                            onChange={() => onAttendanceTypeChange('single')}
                            className={`h-4 w-4 focus:ring-0 border-gray-300 ${checkboxClass}`}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Single</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="radio"
                            name="attendanceType"
                            checked={attendanceType === 'punch'}
                            onChange={() => onAttendanceTypeChange('punch')}
                            className={`h-4 w-4 focus:ring-0 border-gray-300 ${checkboxClass}`}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Punch In/Out</span>
                    </label>
                </div>
            )}
        </div>
    );
};

export default AttendanceTypeSelector;
export type { AttendanceType };
