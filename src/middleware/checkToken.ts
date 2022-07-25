import { AppError, HttpCode } from "../errorHandler/AppError";
import { NextFunction, Request, Response } from "express";
import passport from "passport";

export default (req: Request, res: Response, next: NextFunction) => 
	passport.authenticate('jwt', { session: false }, function(err, user, info) {
		if (!user) {
			throw new AppError({
				httpCode: HttpCode.UNAUTHORIZED,
				description: 'You need to login first.'
			})
		} else {
			next()
		}
	})(req, res, next)