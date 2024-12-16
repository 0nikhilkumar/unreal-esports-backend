import express from "express";
import { createRoom, getHostRooms, getHostRoomById } from "../controllers/room.controller.js";
import { hostVerifyJWT } from "../middlewares/hostAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.route("/create-room").post(hostVerifyJWT, createRoom);
router.route("/get-host-rooms").get(hostVerifyJWT, getHostRooms);
router.route("/get-room/:id").get(hostVerifyJWT, getHostRoomById);

export default router;