import { Router } from "express";
import {
  checkAuth,
  checkHostnameUnique,
  getTeamsByHost,
  getUpdateLeaderboardData,
  login,
  logout,
  refreshAccessToken,
  register,
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

router.route("/register").post(zod_validate(hostSignupSchema), register);
router.route("/login").post(zod_validate(hostLoginSchema), login);
router.route("/refresh").post(refreshAccessToken);
router.route("/logout").get(hostVerifyJWT, logout);
router.route("/check-auth").get(hostVerifyJWT, checkAuth);


router.route("/update-slot/:id").patch(hostVerifyJWT, updateSlotToTeam);
router.route("/update-leaderboard/:id").patch(hostVerifyJWT, updateLeaderboardData);
router.route("/get-leadboard-data/:id").get(hostVerifyJWT, getUpdateLeaderboardData);

router.route("/joined-teams").get(hostVerifyJWT, getTeamsByHost).patch(hostVerifyJWT, updateTierForHost);

router.route("/delete-room/:id").delete(hostVerifyJWT,deleteRoom);

router.route("/check-host-username").get(checkHostnameUnique);

export default router;
