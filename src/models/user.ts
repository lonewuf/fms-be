import mongoose, { Schema, Document, Model } from 'mongoose'
import argon2 from 'argon2'

export enum UserType {
	STUDENT = 'STUDENT',
	ADMIN = 'ADMIN'
}

export interface IUser {
	email: string
	firstName: string
	lastName: string
	studentNumber: string
	password: string
	userType: UserType
}

// methods
export interface IUserDocument extends IUser, Document {
	setPassword: (password: string) => Promise<void>
	verifyPassword: (password: string) => Promise<boolean>
	getFullName: () => string
}

// statics
interface IUserModel extends Model<IUserDocument> {
}

const requiredStringConfig = {
	type: String,
	required: true
}

const UserSchema: Schema = new Schema<IUserDocument>({
	email: requiredStringConfig,
	firstName: requiredStringConfig,
	lastName: requiredStringConfig,
	studentNumber: {
		type: String,
		required: [
			function(this: IUserDocument) {
				return this.userType === UserType.STUDENT
			},
			'Student number is required.'
		]
	},
	password: requiredStringConfig,
	userType: {
		type: String,
		required: true,
		enum: Object.values(UserType)
	}
})

UserSchema.methods.setPassword = async function (password: string) {
	try {
		const hash = await argon2.hash(password)
		this.password =hash
	} catch (err: any) {
		throw new Error(err.message)
	}
}


UserSchema.methods.verifyPassword = async function (password: string) {
	try {
		const isMatch = await argon2.verify(this.password, password)
		return isMatch
	} catch (err: any) {
		throw new Error(err.message)
	}
}

UserSchema.methods.getFullName = function () {
	return `${this.firstName} ${this.lastName}`
}

export default mongoose.model<IUserDocument, IUserModel>('User', UserSchema)