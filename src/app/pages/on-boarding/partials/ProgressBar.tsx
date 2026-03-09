import { FunctionComponent } from 'react';

/**
 * Progress bar props
 */
interface ProgressBarProps {
    progress: OnboardingProgress;
}

/**
 * Progress bar component showing overall onboarding progress
 */
const ProgressBar: FunctionComponent<ProgressBarProps> = ({ progress }) => (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{progress.completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
                className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.completionPercentage}%` }}
            />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {progress.completedSteps} of {progress.totalSteps} steps completed
        </p>
    </div>
);

export default ProgressBar;
