import dotenv from 'dotenv'

dotenv.config()

export default {
	morgan: {
		tiny: 'tiny',
		default: ':method :url :status :res[content-length] - :response-time ms'
	},
	mongodb: {
		options: {
			useUnifiedTopology: true,
			useNewUrlParser: true,
			keepAlive: true,
			autoIndex: true
		},
		username: process.env.MONGO_USERNAME || '',
		password: process.env.MONGO_PASSWORD || '',
		url: process.env.MONGOS_URI || 'mongodb://localhost:27017/fms'
	},
	cloudinary: {
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET
	},
	secret: process.env.SECRET_KEY || 'greenteahazelnut',
	host: process.env.SERVER_HOSTNAME || 'localhost',
	port: process.env.SERVER_PORT || 5000,
	prefix: '/api'
}