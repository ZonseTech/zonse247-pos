import { Box } from '@radix-ui/themes'
import type { FC, PropsWithChildren } from 'react'

const AppLayout: FC<PropsWithChildren> = ({ children }) => {
    return (
        <Box minHeight="100%" px="4" pt="4" pb="4" overflowX="hidden">
            {children}
        </Box>
    )
}

export default AppLayout