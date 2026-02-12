import type { ChangeEvent, FunctionComponent } from 'react';
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
    const handleTrackAttendanceChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked;
        if (!newValue && !allowAppAccess) {
            return;
        }
        onTrackAttendanceChange(newValue);
    };

    const handleAllowAppAccessChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked;

        if (!newValue && !trackAttendance) {
            onTrackAttendanceChange(true);
        }
        onAllowAppAccessChange(newValue);
    };

    return (
        <FormFieldCard>
            <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={trackAttendance}
                        onChange={handleTrackAttendanceChange}
                        className="h-5 w-5 mt-0.5 text-sky-500 focus:ring-0 focus:ring-offset-0 border-gray-300 rounded-sm accent-sky-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Track staff's attendance and salary
                    </span>
                </label>
                <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={allowAppAccess}
                        onChange={handleAllowAppAccessChange}
                        className="h-5 w-5 mt-0.5 text-sky-500 focus:ring-0 focus:ring-offset-0 border-gray-300 rounded-sm accent-sky-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Allow staff to use the app via roles below?
                    </span>
                </label>
            </div>
        </FormFieldCard>
    );
};

export default StaffOptionsFields;
