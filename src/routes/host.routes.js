import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshAccessToken,
} from "../controllers/host.controller.js";
import { hostVerifyJWT } from "../middlewares/hostAuth.middleware.js";
import zod_validate from "../middlewares/zod_validate.middleware.js";
import {
  hostLoginSchema,
  hostSignupSchema,
} from "../Validator/hostValidator.middleware.js";

const router = Router();

router.route("/register").post(zod_validate(hostSignupSchema), register);
router.route("/login").post(zod_validate(hostLoginSchema), login);
router.route("/refresh").post(refreshAccessToken);
router.route("/logout").get(hostVerifyJWT, logout);

export default router;
