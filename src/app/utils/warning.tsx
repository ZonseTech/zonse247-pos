function warn(assert: boolean, scope: string, message: string) {
	if (process.env.NODE_ENV !== 'production') {
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