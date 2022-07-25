import { AppError, HttpCode } from "../errorHandler/AppError";
import { NextFunction, Request, Response } from "express";
import UserModel, { IUser, UserType } from '../models/user'
import jwt from 'jsonwebtoken'
import config from '../config/config'

declare global {
	namespace Express {
		interface User {
			id: string
			firstName: string
			lastName: string
			userType: UserType
		}
	}
}

export type User = {
	id: string
	firstName: string
	lastName: string
	userType: UserType
}

export default  {
	test: (req: Request, res: Response, next: NextFunction) => {
		res.json({
			error: false,
			message: 'Test route for user'
		})	
	},
	view: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { user, params } = req
			const { id, userType } = user as User
			const { _id } = params

			if (id.toString() !== _id && UserType.ADMIN !== userType) {
				throw new Error('Invalid action.')
			}

			const userDoc = await UserModel.findById(_id).select('-password')
			if (userDoc) {
				res.json({
					data: userDoc
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
			const { user, params } = req
			const { id, userType } = user as User
			const { _id } = params

			if (id.toString() !== _id && UserType.ADMIN !== userType) {
				throw new Error('Invalid action.')
			}

			const userDocs = await UserModel.find().select('-password')
			if (userDocs) {
				res.json({
					data: userDocs
				})
			} else {
				throw new Error('Document does not exist')
			}
		} catch(err: any) {
			next(new AppError({ httpCode: HttpCode.BAD_REQUEST, description: err.message }))
		}
	},
	register: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { body } = req
			const data: IUser = body

			const { email, password, studentNumber } = data
			const $or = []
			const userDoc = await UserModel.findOne({ 
				$or: [
					{
						email
					},
					// {
					// 	studentNumber 
					// }
					{
						$and: [
							{
								studentNumber
							},
							{
								studentNumber: {
									$ne: ''
								}
							}
						]
					}
				]
			})

			if (userDoc) {
				throw new Error('Email or student number already exist.')
			}

			const newUser = new UserModel({
				...data,
				userType: UserType.STUDENT
			})			
			await newUser.setPassword(password)
			await newUser.save()

			res.json({
				error: false,
				message: 'User created successfully.'
			})
		} catch(err: any) {
			next(new AppError({ httpCode: HttpCode.BAD_REQUEST, description: err.message }))
		}
	},
	login: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const data: { email: string, password: string} = req.body
			const { email, password } = data

			if (!email || !password) {
				throw new Error('Email and password are required.')
			}

			const userDoc = await UserModel.findOne({ email })
			if (!userDoc) {
				throw new Error('User not found.')
			}

			if (!await userDoc.verifyPassword(password)) {
				throw new Error('Incorrect credentials.')
			}
			const payload = { id: userDoc._id, name: userDoc.getFullName(), userType: userDoc.userType }

			jwt.sign(
				payload,
				config.secret,
				{ expiresIn: 3600 },
				(err, token) => {
					if (err) {
						throw new Error(err.message)
					}
					res.json({
						error: false,
						token: 'Bearer ' + token
					});
				}
			)

		} catch(err: any) {
			next(new AppError({ httpCode: HttpCode.BAD_REQUEST, description: err.message }))
		}
	},
	currentUser: async (req: Request, res: Response, next: NextFunction) => {
		try {
			// assertHasUser(req, next)
			if (req.user) {
				const { id, firstName, lastName , userType } = req.user
				res.json({
					id,
					userType,
					name: `${firstName} ${lastName}`,
				})
			} else {
				throw new Error('You need to login first')
			}
		} catch (err: any) {
			next(new AppError({ httpCode: HttpCode.BAD_REQUEST, description: err.message }))
		}
	}
}