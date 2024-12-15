import express from "express";
import { createRoom, getHostRooms } from "../controllers/room.controller.js";
import { hostVerifyJWT } from "../middlewares/hostAuth.middleware.js";

const router = express.Router();

router.route("/create-room").post(hostVerifyJWT,createRoom);
router.route("/get-host-rooms").get(hostVerifyJWT, getHostRooms);

export default router;