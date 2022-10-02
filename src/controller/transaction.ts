import { AppError, HttpCode } from "../errorHandler/AppError";
import { NextFunction, Request, Response } from "express";
import { SchemaDataType, UserType } from '../models/user'
import TransactionModel, { ITransactionDocument, TransactionType } from "../models/transaction";
import StatusModel from "../models/status";
import { User } from "./user";
import { Types } from 'mongoose'
import sanitize from "mongo-sanitize";

const validApprovers = [
	'ADMIN',
	'CHAIRPERSON',
	'DEAN',
	'VPAA'
]

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
			const { id, userType } = user as User
			const data: { transactionType: TransactionType } = body

			if (userType !== UserType.STUDENT) throw new Error('Students are only allowed to create transaction.')

			const statusDoc = await StatusModel.findOne({ status: "For Chairperson's Approval" })
			if (!statusDoc) {
				throw new Error('Status does not exist')
			}

			const newTransaction = new TransactionModel({
				student: id,
				status: statusDoc._id,
				...body
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


			const transactionDoc = await TransactionModel.findById(_id).populate('status', '_id status').populate('student', '_id firstName lastName studentNumber studentType')
			if (transactionDoc) {
				if (userType === UserType.STUDENT && id.toString() !== transactionDoc.student._id.toString()) {
					throw new Error('Invalid action')
				}
				res.json({
					data: transactionDoc
				})
			} else {
				throw new Error('Document does not exist')
			}

		} catch(err: any) {
			console.log(err,'error')
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
					student: id
				}
			}

			// const transactionDocs = await TransactionModel.find(match)
			const transactionDocs = await TransactionModel.aggregate(TransactionModel.schemaData(SchemaDataType.TABLE, user))
			res.json({
				data: transactionDocs
			})
		} catch(err: any) {
			console.log(err, 'error')
			next(new AppError({ httpCode: HttpCode.BAD_REQUEST, description: err.message }))
		}
	},
	update: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { params, user } = req
			const { userType } = user as User
			const { _id } = params

			let transactionDoc = await TransactionModel.findById(_id)
			if (transactionDoc) {
				// if (userType !== UserType.ADMIN) {
				// 	throw new Error('Invalid action')
				// }
				transactionDoc = Object.assign(transactionDoc, {...req.body})
				const updateDoc = await (transactionDoc as (ITransactionDocument & {
					_id: Types.ObjectId;
				}) ).save()
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
				if (userType === UserType.STUDENT) {
					throw new Error('Invalid action')
				}
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
	newApprove: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { params, user } = req
			const { userType } = user as User
			const { _id } = params

			const transactionDoc = await TransactionModel.findById(_id)
			if (transactionDoc) {
				if (userType === UserType.STUDENT) {
					throw new Error('Invalid action')
				}
				await transactionDoc.processNextStatus()
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
	transactionNextStatus: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { params, user } = req
			const { userType } = user as User
			const { _id } = params

			const transactionDoc = await TransactionModel.findById(_id)
			if (transactionDoc) {
				const statusDoc = await StatusModel.findById(transactionDoc.status)
				res.json({
					data: statusDoc
				})
			} else {
				throw new Error('Document does not exist')
			}

		} catch(err: any) {
			next(new AppError({ httpCode: HttpCode.BAD_REQUEST, description: err.message }))
		}

	}
}