import { FunctionComponent } from 'react';

export const DashedDivider: FunctionComponent = () => (
    <div className="border-t border-dashed border-gray-400 dark:border-gray-500 my-2" />
);

export const SolidDivider: FunctionComponent = () => (
    <div className="border-t border-gray-400 dark:border-gray-500 my-2" />
);
