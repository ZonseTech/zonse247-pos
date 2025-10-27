import { useLocation } from "react-router"
import { NProgress } from "../../config/n-progress"
import { FunctionComponent, useEffect } from "react"

export const NavigationProgress: FunctionComponent = () => {
    const location = useLocation()

    useEffect(() => {
        NProgress.start()
        const timer = setTimeout(() => {
            NProgress.done()
        }, 100)

        return () => {
            clearTimeout(timer)
            NProgress.done()
        }
    }, [location])

    return null
}