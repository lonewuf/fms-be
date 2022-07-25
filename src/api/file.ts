import { Router } from "express";
import FileController from '../controller/file'
import multer from 'multer'

const fileUpload = multer()

export default (router: Router) => {
	router.route('/file/test')
		.get(
			FileController.test
		)

	router.route('/file/upload/:_field/:_id')
		.post(
			fileUpload.single('file'),
			FileController.upload
		)
}