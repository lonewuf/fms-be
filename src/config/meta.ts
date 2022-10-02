import { UserType } from "../models/user"

const meta = {
	adminUser: {
		firstName: 'Admin',
		lastName: 'User',
		email: 'admin.user@gmail.com',
		password: 'admintestuser',
		userType: UserType.ADMIN
	},
	studentUser: {
		firstName: 'Admin',
		lastName: 'User',
		email: 'admin.user@gmail.com',
		password: 'admintestuser',
		userType: UserType.STUDENT,
		studentNumber: '2022-00001-MN-0'
	},
	// Accreditation
	// Professor -> ChairPerson -> Dean

	// Tutorial
	// ChairPerson -> Dean -> VPAA

	// Completion
	// ChairPerson -> Dean
	transactionStatus: [
		// Accreditation
		'PENDING-Chairperson-ACCREDITATION',
		'APPROVED-Chairperson-ACCREDITATION',
		'PENDING-Dean-ACCREDITATION',
		'APPROVED-Dean-ACCREDITATION',

		// Tutorial
		'PENDING-Chairperson-TUTORIAL',
		'APPROVED-Chairperson-TUTORIAL',
		'PENDING-Dean-TUTORIAL',
		'APPROVED-Dean-TUTORIAL',
		'PENDING-VPAA-TUTORIAL',
		'APPROVED-VPAA-TUTORIAL',

		// Completion
		'PENDING-Chairperson-COMPLETION',
		'APPROVED-Chairperson-COMPLETION',
		'PENDING-Dean-COMPLETION',
		'APPROVED-Dean-COMPLETION'
	]
}

export default meta