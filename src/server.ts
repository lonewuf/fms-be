import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import morgan from 'morgan'
import config from './config/config'
import { ConsoleType, logger } from './config/logger'
import passport from 'passport'
import JwtStrategy from './passport/passport'
import { errorHandler } from './errorHandler/ErrorHandler'
import routes from './api'

const app = express()
const { mongodb, morgan: morganConfig, port, prefix } = config

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose
	.connect(mongodb.url, mongodb.options)
	.then(() => {
		logger(ConsoleType.info, 'Connected to the database', mongodb.url)
	})
	.catch(error => {
		logger(ConsoleType.error, mongodb.url)
		logger(ConsoleType.error, error.message, error)
	})

app.use(passport.initialize())
JwtStrategy(passport)


app.use(cors({
	origin: '*'
}))

app.use(morgan(morganConfig.default))

app.use(`${prefix}`, routes)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	logger(ConsoleType.error, err.message, err)
	next(err)
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	errorHandler.handleError(err, res)
})

app.listen(port, () => {
	console.log(`Server is running on port ${port}`)
})