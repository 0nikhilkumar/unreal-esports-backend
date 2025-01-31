import { Router } from "express";
import {
  checkAuth,
  checkHostnameUnique,
  getHostProfile,
  getHostSocialMediaLinks,
  getTeamsByHost,
  getUpdateLeaderboardData,
  login,
  logout,
  refreshAccessToken,
  register,
  updateHostProfile,
  updateHostSocialMediaLink,
  updateLeaderboardData,
  updateSlotToTeam,
  updateTierForHost
} from "../controllers/host.controller.js";
import { hostVerifyJWT } from "../middlewares/hostAuth.middleware.js";
import zod_validate from "../middlewares/zod_validate.middleware.js";
import {
  hostLoginSchema,
  hostSignupSchema,
} from "../Validator/hostValidator.middleware.js";
import { deleteRoom } from "../controllers/room.controller.js";

const router = Router();

router.route("/register").post(register);
router.route("/login").post(zod_validate(hostLoginSchema), login);
router.route("/refresh").post(refreshAccessToken);
router.route("/logout").get(hostVerifyJWT, logout);
router.route("/check-auth").get(hostVerifyJWT, checkAuth);
router.route("/get-host-profile").get(hostVerifyJWT, getHostProfile);
router.route("/update-host-profile").patch(hostVerifyJWT, updateHostProfile);

router.route("/get-host-socialMedia-links").get(hostVerifyJWT, getHostSocialMediaLinks);
router.route("/update-host-socialMedia-links").patch(hostVerifyJWT, updateHostSocialMediaLink);

router.route("/update-slot/:id").patch(hostVerifyJWT, updateSlotToTeam);
router.route("/update-leaderboard/:id").patch(hostVerifyJWT, updateLeaderboardData);
router.route("/get-leadboard-data/:id").get(hostVerifyJWT, getUpdateLeaderboardData);

router.route("/joined-teams").get(hostVerifyJWT, getTeamsByHost).patch(hostVerifyJWT, updateTierForHost);

router.route("/delete-room/:id").delete(hostVerifyJWT,deleteRoom);

router.route("/check-host-username").get(checkHostnameUnique);

export default router;
