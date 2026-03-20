import type { FC, PropsWithChildren } from 'react'

const AppLayout: FC<PropsWithChildren> = ({ children }) => {
    return (
        <div className="min-h-full px-4 md:px-6 pb-4">
            {children}
        </div>
    )
}

export default AppLayout