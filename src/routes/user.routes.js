import { Router } from "express";
import {
  userSignup,
  userLogin,
  refreshAccessToken,
  logout,
  userJoinRoom,
  getAllUserJoinedRooms,
  createTeam,
  getUserTeam,
  updateTeam,
  getHostRoomById,
  checkAuth,
  recentMatchLeaderboard,
  checkUsernameUnique,
  sendOTPToEmail,
  sendOTPToEmailForForgotPassword,
  verifyOTPForForgotPassword,
  forgotPassword,
  getUserProfile,
  updateUserProfile,
  updateSocialMediaLink,
  getSocialMediaLinks,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import zod_validate from "../middlewares/zod_validate.middleware.js";
import {
  loginSchema,
  signupSchema,
} from "../Validator/userValidator.middleware.js";


const router = Router();

router.route("/send-otp-to-email").post(sendOTPToEmail);
router.route("/signup").post(userSignup);
router.route("/login").post(userLogin);
router.route("/get-user-profile").get(verifyJWT, getUserProfile)
router.route("/update-user-profile").patch(verifyJWT,updateUserProfile);

router.route("/refresh").post(refreshAccessToken);
router.route("/logout").get(verifyJWT, logout);
router.route("/check-auth").get(checkAuth);

router.route("/join-room").patch(verifyJWT, userJoinRoom);
router.route("/joined-rooms").get(verifyJWT, getAllUserJoinedRooms);

router.route("/get-room/:id").get(verifyJWT, getHostRoomById);
router.route("/create-team").post(verifyJWT, createTeam);
router.route("/get-team").get(verifyJWT, getUserTeam);
router.route("/update-team").patch(verifyJWT, updateTeam);
router.route("/get-socialMedia-links").get(verifyJWT, getSocialMediaLinks);
router.route("/update-socialMedia-links").patch(verifyJWT, updateSocialMediaLink);
router.route("/get-leaderboard-data").post(verifyJWT, recentMatchLeaderboard);

router.route("/check-username").get(checkUsernameUnique);

router.route("/send-otp-for-forgot-password").post(verifyJWT, sendOTPToEmailForForgotPassword);
router.route("/verify-otp-for-forgot-password").post(verifyJWT, verifyOTPForForgotPassword);
router.route("/forgot-password").patch(verifyJWT, forgotPassword);



export default router;
