export enum ConsoleType {
	info = 'info',
	warn = 'warn',
	error = 'error',
	log = 'log',
	debug = 'debug'
}

export const logger = (type: ConsoleType, message: string, object?: any) => {
	const date = new Date().toISOString()
	if (object) {
		console[type](`[${date}] [${type.toUpperCase()}] ${message}`)
	}
}