import React, { useLayoutEffect, useMemo } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import defaultTheme from '../theme/config'
import { mergeDeep } from '../utils/mergeDeep'
import useDarkMode from '../hooks/useDarkMode'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    theme?: object
    dark?: boolean
    usePreferences?: boolean;
}

const ZonseUIKitContext: React.FC<Props> = ({
    children,
    theme: customTheme,
    dark,
    usePreferences = false,
}) => {
    const mergedTheme = mergeDeep(defaultTheme, customTheme)
    const [mode, setMode, toggleMode] = useDarkMode(usePreferences)

    useLayoutEffect(() => {
        if (dark) {
            if (setMode != null) {
                setMode('dark')
            }
            document.documentElement.classList.add(`dark`)
        }
    }, [dark, setMode])

    const value = useMemo(
        () => ({
            theme: mergedTheme,
            mode,
            toggleMode,
        }),
        [mode, mergedTheme, toggleMode]
    ) as any

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export default ZonseUIKitContext