import { Box } from '@radix-ui/themes'
import type { FC, PropsWithChildren } from 'react'

const AppLayout: FC<PropsWithChildren> = ({ children }) => {
    return (
        <Box minHeight="100%" px={{ initial: "2", sm: "4" }} pt={{ initial: "2", sm: "4" }} pb={{ initial: "2", sm: "4" }} overflowX="hidden">
            {children}
        </Box>
    )
}

export default AppLayout