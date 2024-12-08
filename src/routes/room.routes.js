import express from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { createRoom } from "../controllers/room.controller.js";

const router = express.Router();

router.route("/create-room").post(verifyJWT, createRoom);

export default router;