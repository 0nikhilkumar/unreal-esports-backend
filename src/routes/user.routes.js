import {Router} from 'express'
import { userSignup,userLogin,refreshAccessToken, logout } from '../controllers/user.controller.js'
import { verifyJWT } from '../middlewares/auth.middlewares.js';


const userRouter = Router()

userRouter.route('/signup').post(userSignup);
userRouter.route('/login').post(userLogin);
userRouter.route('/refresh').post(refreshAccessToken);
userRouter.route('/logout').get(verifyJWT, logout);



export default userRouter