import { Fragment } from 'react'
import type { FC, PropsWithChildren } from 'react'

const AppLayout: FC<PropsWithChildren> = ({ children }) => {
    return (
        <Fragment>
            {children}
        </Fragment>
    )
}

export default AppLayout