interface AppConfig {
	apiUrl: string;
	databaseUrl: string;
	secretKey: string;
	nodeEnv: string;
}

interface Config {
	app: {
		name: string;
		version: string;
		description: string;
		users: string;
		contact: string;
		license: string;
	};
	server: {
		port: number;
		host: string;
		environment: string;
		trustProxy: boolean;
		timeout: number;
	};
	database: {
		host: string;
		port: number;
		database: string;
		user: string;
		dataPath: string;
		password: string;
		migrate: boolean;
		seed: boolean;
		waitForConnections: boolean;
		connectionLimit: number;
		queueLimit: number;
	};
	jwt: {
		secret: string;
		expiresIn: string;
		refreshSecret: string;
		refreshExpiresIn: string;
	};
	security: {
		bcryptSaltRounds: number;
		allowedOrigins: string[];
		requestSizeLimit: string;
	};
	rateLimiting: {
		windowMs: number;
		maxRequests: number;
		authMaxRequests: number;
		accountCreationLimit: number;
	};
	logging: {
		level: string;
		enableAnalytics: boolean;
		filePath: string;
	};
	sync: {
		enabled: boolean;
		interval: number;
	};
	upload: {
		maxFileSize: string;
		uploadPath: string;
		migrationsPath: string;
	};
	email: {
		host: string;
		port: number;
		user: string;
		password: string;
		secure: string;
		from: string;
	};
	redis: {
		host: string;
		port: number;
		password?: string;
	};
}
