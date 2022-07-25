import { Router } from "express";
import passport from "passport";
import UserController from '../controller/user'
import checkToken from "../middleware/checkToken";

export default (router: Router) => {
	router.route('/user')
		.get(
			checkToken,
			passport.authenticate('jwt', { session: false }),
			UserController.viewAll
		)

	router.route('/user/test')
		.get(
			UserController.test
		)

	router.route('/user/register')
		.post(
			UserController.register
		)

	router.route('/user/login')
		.post(
			UserController.login
		)

	router.route('/user/current')
		.get(
			checkToken,
			passport.authenticate('jwt', { session: false }),
			UserController.currentUser
		)

	router.route('/user/:_id')
		.get(
			checkToken,
			passport.authenticate('jwt', { session: false }),
			UserController.view
		)
}