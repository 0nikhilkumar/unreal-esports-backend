import {Router} from 'express'
import { register, login, logout, refreshAccessToken } from '../controllers/host.controller.js'
import { hostVerifyJWT } from '../middlewares/hostAuth.middleware.js';
import zod_validate from '../middlewares/zod_validate.middleware.js';
import { hostSignupSchema } from '../Validator/hostValidator.middleware.js';


const router = Router()

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/refresh').post(refreshAccessToken);
router.route('/logout').get(hostVerifyJWT, logout);



export default router;