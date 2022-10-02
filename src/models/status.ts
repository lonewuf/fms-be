import mongoose, { Schema, Document, Model } from 'mongoose'

export enum StatusType {
	// // Accreditation
	// PENDING_CHAIRPERSON_ACCREDITATION = 'PENDING_Chairperson_ACCREDITATION',
	// APPROVED_Chairperson_ACCREDITATION = 'APPROVED_Chairperson_ACCREDITATION',
	// PENDING_Dean_ACCREDITATION = 'PENDING_Dean_ACCREDITATION',
	// APPROVED_Dean_ACCREDITATION = 'APPROVED_Dean_ACCREDITATION',

	// // Tutorial
	// PENDING_Chairperson_TUTORIAL = 'PENDING_Chairperson_TUTORIAL',
	// APPROVED_Chairperson_TUTORIAL = 'APPROVED_Chairperson_TUTORIAL',
	// PENDING_Dean_TUTORIAL = 'PENDING_Dean_TUTORIAL',
	// APPROVED_Dean_TUTORIAL = 'APPROVED_Dean_TUTORIAL',
	// PENDING_VPAA_TUTORIAL = 'PENDING_VPAA_TUTORIAL',
	// APPROVED_VPAA_TUTORIAL = 'APPROVED_VPAA_TUTORIAL',

	// // Completion
	// PENDING_Chairperson_COMPLETION = 'PENDING_Chairperson_COMPLETION',
	// APPROVED_Chairperson_COMPLETION = 'APPROVED_Chairperson_COMPLETION',
	// PENDING_Dean_COMPLETION = 'PENDING_Dean_COMPLETION',
	// APPROVED_Dean_COMPLETION = 'APPROVED_Dean_COMPLETION',

	// // Others
	// PENDING_Chairperson_OTHERS = 'PENDING_Chairperson_OTHERS',
	// APPROVED_Chairperson_OTHERS = 'APPROVED_Chairperson_OTHERS',
	// PENDING_Dean_OTHERS = 'PENDING_Dean_OTHERS',
	// APPROVED_Dean_OTHERS = 'APPROVED_Dean_OTHERS'

	FOR_CHAIPERSON_APPROVAL = "For Chairperson's Approval",
	FOR_DEAN_APPROVAL ="For Dean's Approval",
	FOR_VPAA_APPROVAL ="For VPAA's Approval",
	DONE = "Done"
}

interface IStatus {
	status: StatusType
}

// methods
export interface IStatusDocument extends IStatus, Document {
}

// statics
interface IStatusModel extends Model<IStatusDocument> {
}

const StatusSchema: Schema = new Schema<IStatusDocument>({
	status: {
		type: String,
		required: true,
		enum: Object.values(StatusType),
		unique: true,
		immutable: true
	}
}, {
	autoCreate: true,
	timestamps: true
})

export default mongoose.model<IStatusDocument, IStatusModel>('Status', StatusSchema)