import { AppError, HttpCode } from "../errorHandler/AppError";
import { NextFunction, Request, Response } from "express";
import { UserType } from '../models/user'
import TransactionModel, { TransactionType, Status } from "../models/transaction";
import { User } from "./user";
import { Schema } from 'mongoose'


const ObjectId = Schema.Types.ObjectId

export default  {
	test: (req: Request, res: Response, next: NextFunction) => {
		res.json({
			error: false,
			message: 'Test route for transaction'
		})	
	},
	create: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { body, user } = req
			const { id } = user as User
			const data: { transactionType: TransactionType } = body

			const newTransaction = new TransactionModel({
				student: id,
				transactionType: data.transactionType,
				dateSubmitted: new Date(),
				status: Status.SUBMITTED
			})
			const createdTransaction = await newTransaction.save()

			res.json({
				data: createdTransaction
			})
		} catch(err: any) {
			next(new AppError({ httpCode: HttpCode.BAD_REQUEST, description: err.message }))
		}
	},
	view: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { params, user } = req
			const { id, userType } = user as User
			const { _id } = params


			const transactionDoc = await TransactionModel.findById(_id)
			if (transactionDoc) {
				if (userType !== UserType.ADMIN && id.toString() !== transactionDoc.student.toString()) {
					throw new Error('Invalid action')
				}
				res.json({
					data: transactionDoc
				})
			} else {
				throw new Error('Document does not exist')
			}

		} catch(err: any) {
			next(new AppError({ httpCode: HttpCode.BAD_REQUEST, description: err.message }))
		}
	},
	viewAll: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { user } = req
			const { id, userType } = user as User

			let match = {}
			
			if (userType === UserType.STUDENT) {
				match = {
					student: new ObjectId(id)
				}
			}

			const transactionDocs = await TransactionModel.find(match).populate(['student', 'approvedBy']).exec()
			res.json({
				data: transactionDocs
			})
		} catch(err: any) {
			next(new AppError({ httpCode: HttpCode.BAD_REQUEST, description: err.message }))
		}
	},
	update: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { params, user } = req
			const { userType } = user as User
			const { _id } = params

			const transactionDoc = await TransactionModel.findById(_id)
			if (transactionDoc) {
				if (userType !== UserType.ADMIN) {
					throw new Error('Invalid action')
				}
				transactionDoc.remarks = req.body.remarks
				transactionDoc.status = Status.PENDING
				const updateDoc = await transactionDoc.save()
				res.json({
					data: updateDoc
				})
			} else {
				throw new Error('Document does not exist')
			}

		} catch(err: any) {
			next(new AppError({ httpCode: HttpCode.BAD_REQUEST, description: err.message }))
		}
	},
	approve: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { params, user } = req
			const { userType } = user as User
			const { _id } = params

			const transactionDoc = await TransactionModel.findById(_id)
			if (transactionDoc) {
				if (userType !== UserType.ADMIN) {
					throw new Error('Invalid action')
				}
				transactionDoc.status = Status.DONE
				const updateDoc = await transactionDoc.save()
				res.json({
					data: updateDoc
				})
			} else {
				throw new Error('Document does not exist')
			}

		} catch(err: any) {
			next(new AppError({ httpCode: HttpCode.BAD_REQUEST, description: err.message }))
		}
	}
}