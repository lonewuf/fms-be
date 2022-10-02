import { AppError, HttpCode } from "../errorHandler/AppError";
import { NextFunction, Request, Response } from "express";
import UserModel, { IUser, SchemaDataType, UserStatusType, UserType } from '../models/user'
import jwt from 'jsonwebtoken'
import config from '../config/config'
import sanitize from "mongo-sanitize";

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

			if (UserType.STUDENT === userType) {
				throw new Error('Invalid action.')
			}

			const userDocs = await UserModel.aggregate(UserModel.schemaData(SchemaDataType.TABLE, user))
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
	update: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { body, params } = req
			const data: IUser = body

			const { email, password, studentNumber } = data
			const $or = []

			let userDoc = await UserModel.findById(sanitize(params._id))
			if (!userDoc) {
				throw new Error('No user found.')
			}

			if (email !== userDoc.email) {
				const doc = await UserModel.findOne({ email: sanitize(email)})
				if (doc) {
					throw new Error('Email already exist.')
				}
			}

			if (userDoc.userType === UserType.STUDENT && studentNumber !== userDoc.studentNumber) {
				const doc = await UserModel.findOne({ studentNumber: sanitize(studentNumber)})
				if (doc) {
					throw new Error('Student Number already exist.')
				}
			}

			userDoc = Object.assign(userDoc, data)
			if (password) {
				await userDoc.setPassword(password)
			}
			await userDoc.save()

			res.json({
				error: false,
				message: 'User updated successfully.'
			})
		} catch(err: any) {
			console.log(err)
			next(new AppError({ httpCode: HttpCode.BAD_REQUEST, description: err.message }))
		}

	},
	operation: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { _id, _operation } = req.params

			const validOperations = ['activate', 'deactivate']
			if (!validOperations.includes(_operation)) {
				throw new Error('Operation is invalid.')
			}

			let userDoc = await UserModel.findById(sanitize(_id))
			if (!userDoc) {
				throw new Error('No user found.')
			}

			userDoc.status = _operation === 'activate' ? UserStatusType.ACTIVE : UserStatusType.INACTIVE
			const updatedDoc = await userDoc.save()

			res.json({
				data: updatedDoc,
				message: `User successfully ${_operation}d.`
			})
		} catch (err: any) {
			next(new AppError({ httpCode: HttpCode.BAD_REQUEST, description: err.message }))
		}
	},
	registerFromAdmin: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { body, user } = req
			const data: IUser = body

			const { email, password, studentNumber } = data

			const $or: any = [
				{
					email
				}
			]

			if (user?.userType === UserType.STUDENT) {
				$or.push({
					$and: [
						{
							studentNumber
						},
						{
							studentNumber: {
								$ne: null
							}
						}
					]
				})				
			}

			const userDoc = await UserModel.findOne({ $or })

			if (userDoc) {
				throw new Error('Email or student number already exist.')
			}

			const newUser = new UserModel({
				...data
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
	register: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { body } = req
			const data: IUser = body

			const { email, password, studentNumber } = data

			const userDoc = await UserModel.findOne({ 
				$or: [
					{
						email
					},
					{
						studentNumber
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