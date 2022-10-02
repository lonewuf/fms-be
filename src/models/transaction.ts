import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { IUserDocument, UserType } from './user'
import file, { FileType } from './schema/file'
import Status, { IStatusDocument, StatusType } from './status'

const ObjectId = mongoose.Types.ObjectId

export enum TransactionType {
	ACCREDITATION = 'ACCREDITATION',
	COMPLETION = 'COMPLETION',
	TUTORIAL = 'TUTORIAL',
	OTHERS = 'OTHERS'
}

interface ITransaction {
	student: IUserDocument['_id']
	approvedBy?: IUserDocument['_id']
	transactionType: TransactionType
	subjectDescription: string
	subjectCode: string
	semester: string
	yearAndSection: string
	status: IStatusDocument['_id']
	remarks: string
	approvers: {
		chairPerson?: IUserDocument['_id'],
		dean?: IUserDocument['_id'],
		vpaa?: IUserDocument['_id']
	}
	others: string
	isDone: boolean
	submittedFile?: FileType
	approvedFile?: FileType
	dateSubmitted: Date
	dateApproved?: Date | null
}

// const transactionProcesses = {
// 	ACCREDITATION: [
// 		'PENDING_Chairperson_ACCREDITATION',
// 		'APPROVED_Chairperson_ACCREDITATION',
// 		'PENDING_Dean_ACCREDITATION',
// 		'APPROVED_Dean_ACCREDITATION'
// 	],
// 	TUTORIAL: [
// 		'PENDING_Chairperson_TUTORIAL',
// 		'APPROVED_Chairperson_TUTORIAL',
// 		'PENDING_Dean_TUTORIAL',
// 		'APPROVED_Dean_TUTORIAL',
// 		'PENDING_VPAA_TUTORIAL',
// 		'APPROVED_VPAA_TUTORIAL',
// 	],
// 	COMPLETION: [
// 		'PENDING_Chairperson_COMPLETION',
// 		'APPROVED_Chairperson_COMPLETION',
// 		'PENDING_Dean_COMPLETION',
// 		'APPROVED_Dean_COMPLETION',
// 	],
// 	OTHERS: [
// 		'PENDING_Chairperson_OTHERS',
// 		'APPROVED_Chairperson_OTHERS',
// 		'PENDING_Dean_OTHERS',
// 		'APPROVED_Dean_OTHERS',
// 	]
// }

const transactionProcesses = {
	ACCREDITATION: [
		"For Chairperson's Approval",
		"For Dean's Approval",
		"Done"
	],
	TUTORIAL: [
		"For Chairperson's Approval",
		"For Dean's Approval",
		"For VPAA's Approval",
		"Done"
	],
	COMPLETION: [
		"For Chairperson's Approval",
		"For Dean's Approval",
		"Done"
	],
	OTHERS: [
		"For Chairperson's Approval",
		"For Dean's Approval",
		"Done"
	]
}

export enum SchemaDataType {
	TABLE = 'table'
}

// methods
export interface ITransactionDocument extends ITransaction, Document {
	validateNextStatus: (transactionType: TransactionType, currentStatus: StatusType, nextStatus: StatusType) => Promise<void>
	statusChecker: (status: string) => Promise<boolean>,
	processNextStatus: () => Promise<void>
	isValidApprover: (userType: UserType) => Promise<void> 
}

// statics
interface ITransactionModel extends Model<ITransactionDocument> {
	schemaData: (type: SchemaDataType, session?: any) => any[]
}

const optionalString = {
	type: String
}

const TransactionSchema: Schema = new Schema<ITransactionDocument>({
	student: {
		type: mongoose.Types.ObjectId,
		ref: 'User',
		required: true
	},
	transactionType: {
		type: String,
		required: true,
		enum: Object.values(TransactionType)
	},
	subjectDescription: optionalString,
	subjectCode: optionalString,
	semester: optionalString,
	yearAndSection: optionalString,
	status: {
		type: mongoose.Types.ObjectId,
		ref: 'Status',
		required: true,
	},
	others: optionalString,
	remarks: optionalString,
	approvers: {
		chairPerson: {
			type: ObjectId,
			ref: 'User'
		},
		dean: {
			type: ObjectId,
			ref: 'User'
		},
		vpaa: {
			type: ObjectId,
			ref: 'User'
		}
	},
	submittedFile: file,
	approvedFile: file,
	isDone: {
		type: Boolean,
		default: false
	},
	dateSubmitted: {
		type: Date
	},
	dateApproved: {
		type: Date
	}
}, {
	autoCreate: true,
	timestamps: true
})

TransactionSchema.pre('save', async function (this: ITransactionDocument, next: (err?: Error) => void) {
	try {
		next()
	} catch (err: any) {
		throw new Error(err.message)
	}
})

TransactionSchema.methods.validateNextStatus = (transactionType: TransactionType, currentStatus: StatusType, nextStatus: StatusType) => {
	const transactionProcess = transactionProcesses[transactionType]
	if (!transactionProcess) {
		throw new Error('Status does not exist.')
	}
	const currentStatusIndex = transactionProcess.indexOf(currentStatus)
	if (transactionProcess[currentStatusIndex + 1] !== nextStatus) {
		throw new Error('Next status is invalid.')
	}
}

TransactionSchema.methods.statusChecker = async function (this: ITransactionDocument, status: string) {
	// Accreditation
	// Professor -> ChairPerson -> Dean

	// Tutorial
	// ChairPerson -> Dean -> VPAA

	// Completion
	// ChairPerson -> Dean
	try {
		const statusDoc = await Status.findOne({ _id: status })
		if (!statusDoc) throw new Error('Status does not exist.')

		const [ statusString, person, transactionType ] = statusDoc.status.split('_')
		const { status: currentStatus } = await Status.findOne(this.status) as IStatusDocument

		this.validateNextStatus(transactionType as TransactionType, currentStatus, statusDoc.status)

	} catch (err: any) {
		throw new Error(err.message)
	}
}

TransactionSchema.methods.isValidApprover = async function (this: ITransactionDocument, userType: UserType) {
	if (userType === UserType.STUDENT) throw new Error('Invalid Action')

	if (userType === UserType.ADMIN) return
	
	const currentStatus = await Status.findById(this._id) 
	if (currentStatus) {
		const formattedCurrentStatus = currentStatus.status.toLocaleLowerCase()
		const formattedUserType = userType.toLocaleLowerCase()

		if (!formattedCurrentStatus.includes(formattedUserType)) throw new Error('User is not the current approver.')

		return
	}
	throw new Error('Invalid Status')
}

TransactionSchema.methods.processNextStatus = async function(this: ITransactionDocument) {
	try {
		const statusDoc = await Status.findById({ _id: this.status })

		// Get next status
		if (statusDoc) {
			const transactionProcess = transactionProcesses[this.transactionType]
			if (!transactionProcess) {
				throw new Error('Status does not exist.')
			}

			const currentStatusIndex = transactionProcess.indexOf(statusDoc.status)
			if (currentStatusIndex === -1) {
				throw new Error('Status does not found.')
			}

			const nextStatus = transactionProcess[currentStatusIndex + 1]
			const nextStatusDoc = await Status.findOne({ status: nextStatus })
			if (!nextStatusDoc) {
				throw new Error(`Status ${nextStatus} is not yet created.`)
			}

			// set status to next status
			this.status = nextStatusDoc._id
			
			if (currentStatusIndex + 1 === transactionProcess.length - 1) this.isDone = true

			return
		}
		throw new Error('No status found.')
	} catch (err: any) {
		throw new Error(err.message)
	}
}


// schema statics
TransactionSchema.statics.schemaData = function(type: SchemaDataType, session?: any) {
	switch (type) {
		case SchemaDataType.TABLE: 
			const { id, userType } = session
			
			let $match = {}
			if (userType === UserType.STUDENT) {
				$match = {
					student: new ObjectId(id)
				}
			}

			return [
				{
					$match
				},
				{
					$lookup: {
						from: 'users',
						localField: 'student',
						foreignField: '_id',
						as: 'student'
					}
				},
				{
					$unwind: {
						path: '$student', 
						preserveNullAndEmptyArrays: true					
					}
				},
				{
					$lookup: {
						from: 'status',
						localField: 'status',
						foreignField: '_id',
						as: 'status'
					}
				},
				{
					$unwind: {
						path: '$status', 
						preserveNullAndEmptyArrays: true					
					}
				},
				{
					$lookup: {
						from: 'users',
						localField: 'approvers.chairPerson',
						foreignField: '_id',
						as: 'approvers.chairPerson'
					}
				},
				{
					$unwind: {
						path: '$approvers.chairPerson', 
						preserveNullAndEmptyArrays: true					
					}
				},
				{
					$lookup: {
						from: 'users',
						localField: 'approvers.dean',
						foreignField: '_id',
						as: 'approvers.dean'
					}
				},
				{
					$unwind: {
						path: '$approvers.dean', 
						preserveNullAndEmptyArrays: true					
					}
				},
				{
					$lookup: {
						from: 'users',
						localField: 'approvers.vpaa',
						foreignField: '_id',
						as: 'approvers.chairPerson'
					}
				},
				{
					$unwind: {
						path: '$approvers.vpaa', 
						preserveNullAndEmptyArrays: true					
					}
				},
				{
					$addFields: {
						studentName: {
							$concat: [
								'$student.firstName',
								' ',
								'$student.lastName'
							]
						}
					}
				},
				{
					$project: {
						_id: 1,
						studentName: 1,
						subjectCode: 1,
						studentNumber: '$student.studentNumber',
						status: '$status.status',
						transactionType: 1,
						createdAt: {
							$dateToString: {
								format: '%Y-%m-%d',
								date: '$createdAt'
							}
						}
					}
				}
			]
		default:
			throw new Error('Schema data type does not exist.')
	}
}


export default mongoose.model<ITransactionDocument, ITransactionModel>('Transaction', TransactionSchema)