import { v2 as cloudinary } from 'cloudinary'
import { NextFunction, Request, Response } from "express";
import streamifier from 'streamifier'
import { AppError, HttpCode } from '../errorHandler/AppError';
import config from '../config/config'
import TransactionModel from '../models/transaction'
import { FileType } from '../models/schema/file';

const { cloudinary: cloudinaryConfig } = config
const { api_key, api_secret, cloud_name } = cloudinaryConfig

cloudinary.config({
	cloud_name,
	api_key,
	api_secret
})

const streamUpload = async (req: Request) => {
	return new Promise((resolve, reject) => {
		let streamUpload = cloudinary.uploader.upload_stream(
			(error, result) => {
				if (result) {
					resolve(result)
				} else {
					reject(error)
				}
			}
		)

		if (req.file) {
			streamifier.createReadStream(req.file.buffer).pipe(streamUpload)
		} else {
			reject('"req.file" is undefined.')
		}
	})
}

const validFiles = [ 'approvedFile', 'submittedFile' ]

export default {
	test: (req: Request, res: Response, next: NextFunction) => {
		res.json({
			message: 'Test route for file.'
		})
	},
	upload: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { _id, _field } = req.params
			const transactionDoc = await TransactionModel.findById(_id)
			if (transactionDoc) {
				const uploadFile = await streamUpload(req) as FileType
				if (_field === 'approvedFile') {
					transactionDoc.approvedFile = uploadFile
				}
				if (_field === 'submittedFile') {
					transactionDoc.submittedFile = uploadFile
				}
				const updatedDoc = await transactionDoc.save()
				res.json({
					message: 'File uploaded successfully.',
					data: updatedDoc
				})
			} else {
				throw new Error('Document does not exist')
			}

		} catch(err: any) {
			next(new AppError({ httpCode: HttpCode.BAD_REQUEST, description: err.message }))
		}
	}
}