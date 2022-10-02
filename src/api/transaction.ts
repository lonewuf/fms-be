import { Router } from "express";
import passport from "passport";
import TransactionController from '../controller/transaction'
import checkToken from "../middleware/checkToken";

export default (router: Router) => {
	router.route('/transaction')
		.get(
			checkToken,
			passport.authenticate('jwt', { session: false }),
			TransactionController.viewAll
		)
		.post(
			checkToken,
			passport.authenticate('jwt', { session: false }),
			TransactionController.create
		)

	router.route('/transaction/test')
		.get(
			TransactionController.test
		)

	router.route('/transaction/:_id')
		.get(
			checkToken,
			passport.authenticate('jwt', { session: false }),
			TransactionController.view
		)
		.patch(
			checkToken,
			passport.authenticate('jwt', { session: false }),
			TransactionController.update
		)

	router.route('/transaction/approve/:_id')
		.patch(
			checkToken,
			passport.authenticate('jwt', { session: false }),
			TransactionController.newApprove
		)

	router.route('/transaction/nextStatus/:_id')
		.get(
			checkToken,
			passport.authenticate('jwt', { session: false }),
			TransactionController.transactionNextStatus
		)

}