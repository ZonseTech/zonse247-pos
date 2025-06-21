import type { FunctionComponent, PropsWithChildren } from 'react'

const Panel: FunctionComponent<PropsWithChildren> = ({ children }) => {
    return (
        <div className="w-full lg:w-1/2 flex flex-col h-full rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-lg">
            <div className="flex flex-col h-full overflow-hidden p-0">
                {children}
            </div>
        </div>
    )
}

export default Panel