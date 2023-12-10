interface AppConfig {
	name: string;
	host: string;
	port: number;
}

export const appConfig: AppConfig = {
	name: process.env.APP_NAME || 'express',
	host: process.env.APP_HOST || 'localhost',
	port: parseInt(String(process.env.APP_PORT), 10) || 3000,
};
