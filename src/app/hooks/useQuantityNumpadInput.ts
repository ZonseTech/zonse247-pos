// hooks/useQuantityNumpadInput.ts
import { useEffect, useState } from 'react';

interface UseQuantityNumpadInputProps {
    isActive: boolean;
    initialValue: number;
    onValueChange: (value: number) => void;
    numpadInput?: string;
    onInputProcessed?: () => void;
}

export const useQuantityNumpadInput = ({
    isActive,
    initialValue,
    onValueChange,
    numpadInput = '',
    onInputProcessed
}: UseQuantityNumpadInputProps) => {
    const [tempValue, setTempValue] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);

    useEffect(() => {
        if (isActive && !isEditing) {
            setIsEditing(true);
            setTempValue(initialValue.toString());
        } else if (!isActive && isEditing) {
            finishEditing();
        }
    }, [isActive, initialValue]);

    useEffect(() => {
        if (numpadInput !== '' && isActive && isEditing) {
            handleNumpadInput(numpadInput);
            if (onInputProcessed) {
                onInputProcessed();
            }
        }
    }, [numpadInput, isActive, isEditing]);

    const handleNumpadInput = (input: string) => {
        if (input === 'Del') {
            setTempValue(prev => {
                const newValue = prev.slice(0, -1);
                return newValue === '' ? '0' : newValue;
            });
        } else if (input === 'OK') {
            finishEditing();
        } else if (!isNaN(parseInt(input))) {
            setTempValue(prev => {
                const newValue = prev === '0' ? input : prev + input;
                const numValue = parseInt(newValue);
                return numValue <= 999 ? newValue : prev;
            });
        }
    };

    const finishEditing = () => {
        const numValue = parseInt(tempValue);
        if (!isNaN(numValue) && numValue > 0) {
            onValueChange(numValue);
        } else {
            onValueChange(1);
        }
        setIsEditing(false);
        setTempValue('');
    };

    const handleDirectInput = (value: string) => {
        if (!isEditing) return;

        if (value === '') {
            setTempValue('1');
            return;
        }

        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue > 0 && numValue <= 999) {
            setTempValue(value);
        }
    };

    return {
        displayValue: isEditing ? tempValue : initialValue.toString(),
        isEditing,
        handleDirectInput,
        finishEditing
    };
};