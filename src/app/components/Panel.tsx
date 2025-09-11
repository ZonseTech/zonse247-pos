import type { FunctionComponent, PropsWithChildren } from 'react'

type Size = '1' | '1/2' | '1/3' | '1/4' | '1/5' | '1/6' | '2/3' | '2/4' | '2/5' | '3/4' | '3/5' | '4/5' | '5/6' | 'full'

const Panel: FunctionComponent<PropsWithChildren<{ size?: Size, className?: string }>> = ({ children, size = 'full', className = '' }) => {
    const sizeClass = size === '1' || size === 'full' ? 'w-full' : `w-${size}`

    return (
        <div className={`${sizeClass} flex flex-col h-full bg-white dark:bg-gray-800 ${className}`}>
            <div className="flex flex-col h-full overflow-hidden p-0">
                {children}
            </div>
        </div>
    )
}

export default Panel