import mongoose from 'mongoose'
import StatusModel from '../models/status'
import config from '../config/config'

const { mongodb } = config

// const statuses = [
// 	// Accreditation
// 	'PENDING_Chairperson_ACCREDITATION',
// 	'APPROVED_Chairperson_ACCREDITATION',
// 	'PENDING_Dean_ACCREDITATION',
// 	'APPROVED_Dean_ACCREDITATION',

// 	// Tutorial
// 	'PENDING_Chairperson_TUTORIAL',
// 	'APPROVED_Chairperson_TUTORIAL',
// 	'PENDING_Dean_TUTORIAL',
// 	'APPROVED_Dean_TUTORIAL',
// 	'PENDING_VPAA_TUTORIAL',
// 	'APPROVED_VPAA_TUTORIAL',

// 	// Completion
// 	'PENDING_Chairperson_COMPLETION',
// 	'APPROVED_Chairperson_COMPLETION',
// 	'PENDING_Dean_COMPLETION',
// 	'APPROVED_Dean_COMPLETION',

// 	// Others
// 	'PENDING_Chairperson_OTHERS',
// 	'APPROVED_Chairperson_OTHERS',
// 	'PENDING_Dean_OTHERS',
// 	'APPROVED_Dean_OTHERS'
// ]

const statuses = [
	"For Chairperson's Approval",
	"For Dean's Approval",
	"For VPAA's Approval",
	"Done",
	"Rejected"
]

const seedStatus = async () => {
	console.log('Seeding statuses...')
	console.log('Connecting to database ...')
	await mongoose.connect(mongodb.url, mongodb.options)
	console.log('Connected to database.')
	try {
		const promises = statuses.map(async (item) => {
			const statusDoc = await StatusModel.findOne({ status: item })
			if (!statusDoc) await StatusModel.create({ status: item })
		})
		await Promise.all(promises)
		console.log('Seeding done.')
	} catch (err: any) {
		throw new Error(err)
	}
	process.exit(0)
}

seedStatus()