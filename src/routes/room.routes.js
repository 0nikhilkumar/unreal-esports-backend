import express from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { createRoom, getHostRooms } from "../controllers/room.controller.js";

const router = express.Router();

router.route("/create-room").post(createRoom);
router.route("/get-host-rooms").get(verifyJWT, getHostRooms);

export default router;