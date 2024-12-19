import { Router } from "express";
import {
  userSignup,
  userLogin,
  refreshAccessToken,
  logout,
  userJoinRoom,
  getAllUserJoinedRooms,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import zod_validate from "../middlewares/zod_validate.middleware.js";
import {
  loginSchema,
  signupSchema,
} from "../Validator/userValidator.middleware.js";
import { getHostRooms } from "../controllers/room.controller.js";

const router = Router();

router.route("/signup").post(zod_validate(signupSchema), userSignup);
router.route("/login").post(zod_validate(loginSchema), userLogin);
router.route("/refresh").post(refreshAccessToken);
router.route("/logout").get(verifyJWT, logout);
router.route("/join-room").patch(verifyJWT, userJoinRoom);
router.route("/joined-rooms").get(verifyJWT, getAllUserJoinedRooms);


export default router;
