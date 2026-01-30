function warn(assert: boolean, scope: string, message: string) {
	const environment = import.meta.env.VITE_APP_ENV || 'development';

	if (environment !== 'production') {
		if (assert) {
			if (console.warn) {
				console.warn(`ZonseTheme [${scope}]: ${message}`)
			} else {
				console.log(`ZonseTheme [${scope}]: ${message}`)
			}
		}
	}
}

export default warn