import {Router} from 'express'
import { userSignup,userLogin,refreshAccessToken, logout } from '../controllers/user.controller.js'
import { verifyJWT } from '../middlewares/auth.middlewares.js';
import zod_validate from '../middlewares/zod_validate.middleware.js';
import { loginSchema, signupSchema } from '../Validator/userValidator.middleware.js';


const router = Router()

router.route('/signup').post(userSignup);
router.route('/login').post(userLogin);
router.route('/refresh').post(refreshAccessToken);
router.route('/logout').get(verifyJWT, logout);



export default router