import { Router } from 'express'
import user from './user'
import file from './file'
import transaction from './transaction'

const router = Router()

user(router)
file(router)
transaction(router)

export default router