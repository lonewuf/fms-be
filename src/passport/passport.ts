import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import UserModel from '../models/user'
import config from '../config/config'
import { PassportStatic } from 'passport';

const opts = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: config.secret
};

export default (passport: PassportStatic) => {
	passport.use(
		new JwtStrategy(opts, async (jwt_payload, done) => {
			try {
				const userDoc = await UserModel.findById(jwt_payload.id)
				if (userDoc) {
					return done(null, userDoc)
				}
				return done(null, false)
			} catch(err) {
				console.log("🚀 ~ file: passport.ts ~ line 28 ~ newJwtStrategy ~ err", err)
			}
		})
	);
}