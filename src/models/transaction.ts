import mongoose, { Schema, Document, Model } from 'mongoose'
import { IUserDocument } from './user'
import file, { FileType } from './schema/file'

const ObjectId = Schema.Types.ObjectId 


export enum TransactionType {
	ACCREDITATION = 'ACCREDITATION',
	COMPLETION = 'COMPLETION',
	TUTORIAL = 'TUTORIAL'
}

export enum Status {
	SUBMITTED = 'SUBMITTED',
	PENDING = 'PENDING',
	DONE = 'DONE'
}

interface ITransaction {
	student: IUserDocument['_id']
	approvedBy?: IUserDocument['_id']
	transactionType: TransactionType
	status: Status
	remarks: String
	submittedFile?: FileType
	approvedFile?: FileType
	dateSubmitted: Date
	dateApproved?: Date | null
}

// methods
export interface ITransactionDocument extends ITransaction, Document {
}

// statics
interface ITransactionModel extends Model<ITransactionDocument> {
}

const TransactionSchema: Schema = new Schema<ITransactionDocument>({
	student: {
		type: ObjectId,
		ref: 'User'
	},
	approvedBy: {
		type: ObjectId,
		ref: 'User'
	},
	transactionType: {
		type: String,
		required: true,
		enum: Object.values(TransactionType)
	},
	status: {
		type: String,
		required: true,
		enum: Object.values(Status),
		default: Status.SUBMITTED
	},
	remarks: {
		type: String
	},
	submittedFile: file,
	approvedFile: file,
	dateSubmitted: {
		type: Date
	},
	dateApproved: {
		type: Date
	}
}, {
	autoCreate: true
})

export default mongoose.model<ITransactionDocument, ITransactionModel>('Transaction', TransactionSchema)