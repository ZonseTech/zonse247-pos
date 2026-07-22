import { FC } from 'react';
import { Check } from 'lucide-react';
import { Box, Flex, Text } from '@radix-ui/themes';
import * as Avatar from '@radix-ui/react-avatar';
import * as Separator from '@radix-ui/react-separator';
import classNames from 'classnames';

export interface FormStep {
    id: number;
    label: string;
}

interface FormStepperProps {
    steps: FormStep[];
    currentStep: number;
    /** Steps the user has already passed validation for */
    completedSteps: number[];
    onStepClick?: (stepId: number) => void;
}

const FormStepper: FC<FormStepperProps> = ({
    steps,
    currentStep,
    completedSteps,
    onStepClick,
}) => (
    <Flex align="start" width="100%">
        {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isActive = step.id === currentStep;
            const isLast = index === steps.length - 1;
            const isClickable = !!onStepClick && (isCompleted || step.id < currentStep);

            return (
                <Flex key={step.id} align="center" flexGrow={isLast ? '0' : '1'}>
                    <Flex direction="column" align="center" gap="2" flexShrink="0">
                        <button
                            type="button"
                            disabled={!isClickable}
                            onClick={() => isClickable && onStepClick?.(step.id)}
                            aria-label={`Step ${step.id}: ${step.label}`}
                            aria-current={isActive ? 'step' : undefined}
                            className={classNames(isClickable ? 'cursor-pointer' : 'cursor-default')}
                        >
                            <Avatar.Root
                                className={classNames(
                                    'flex items-center justify-center w-9 h-9 rounded-full border-2 text-sm font-semibold transition-colors',
                                    isActive
                                        ? 'border-sky-500 bg-sky-500 text-white'
                                        : isCompleted
                                            ? 'border-emerald-500 bg-emerald-500 text-white'
                                            : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800',
                                )}
                            >
                                <Avatar.Fallback delayMs={0}>
                                    {isCompleted && !isActive ? <Check className="w-4 h-4" /> : step.id}
                                </Avatar.Fallback>
                            </Avatar.Root>
                        </button>

                        <Text
                            size="1"
                            weight="medium"
                            align="center"
                            wrap="nowrap"
                            className={classNames(
                                isActive
                                    ? 'text-sky-600 dark:text-sky-400'
                                    : isCompleted
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-gray-500 dark:text-gray-400',
                            )}
                        >
                            {step.label}
                        </Text>
                    </Flex>

                    {!isLast && (
                        <Box flexGrow="1" mx="3" mt="4">
                            <Separator.Root
                                decorative
                                orientation="horizontal"
                                className={classNames(
                                    'h-0.5 w-full transition-colors',
                                    isCompleted ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700',
                                )}
                            />
                        </Box>
                    )}
                </Flex>
            );
        })}
    </Flex>
);

export default FormStepper;
