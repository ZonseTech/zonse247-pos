import PageLoader from "../PageLoader"
import { NProgress } from "../../config/n-progress"
import { FunctionComponent, useEffect } from "react"

export const EnhancedPageLoader: FunctionComponent = () => {
    useEffect(() => {
        NProgress.start()
        return () => {
            NProgress.done()
        }
    }, [])

    return <PageLoader />
}
