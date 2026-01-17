import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import './assets/css/nprogress.css'
import App from './App'

const isDarkMode = () => window.matchMedia('(prefers-color-scheme: dark)').matches

const updateStatusBarStyle = async () => {
	if (!Capacitor.isNativePlatform()) return

	try {
		const dark = isDarkMode()
		// Style.Dark = light text (for dark backgrounds), Style.Light = dark text (for light backgrounds)
		await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light })
		await StatusBar.setBackgroundColor({ color: dark ? '#111827' : '#ffffff' })
	} catch (error) {
		console.error('Error updating StatusBar style:', error)
	}
}

const initializeStatusBar = async () => {
	if (Capacitor.isNativePlatform()) {
		try {
			await StatusBar.setOverlaysWebView({ overlay: false })
			await StatusBar.show()
			await updateStatusBarStyle()

			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateStatusBarStyle)
		} catch (error) {
			console.error('Error initializing StatusBar:', error)
		}
	}
}

initializeStatusBar()

const root = document.getElementById('root')
createRoot(root!).render(
	<StrictMode>
		<App />
	</StrictMode>
)
