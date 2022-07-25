import { NextFunction, Request, Response } from 'express'
import { connection } from 'mongoose'

export default () => ({
	create: async (req: Request, res: Response, next: NextFunction) => {
		const { _model } = req.params
		try {
			const doc = await connection.models[`${_model}`].findOne({})

		} catch(err) {

		}
	},
	read: async (req: Request, res: Response, next: NextFunction) => {

	},
	readAll: async (req: Request, res: Response, next: NextFunction) => {

	},
	update: async (req: Request, res: Response, next: NextFunction) => {

	},
	delete: async (req: Request, res: Response, next: NextFunction) => {

	}
})