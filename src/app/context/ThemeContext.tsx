import React, { createContext } from 'react'
import defaultTheme from '../theme/config'

interface ThemeContextInterface {
    theme: unknown
    mode?: Mode
    toggleMode?: () => void
}

export const ThemeContext = createContext<ThemeContextInterface>({ theme: defaultTheme })

interface ThemeProviderProps {
    children: React.ReactNode
    value?: any
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, value }) => {
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}