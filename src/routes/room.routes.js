import express from "express";
import { createRoom, getHostRooms, getHostRoomById, updateIdp, getIdp } from "../controllers/room.controller.js";
import { hostVerifyJWT } from "../middlewares/hostAuth.middleware.js";
// import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.route("/create-room").post(hostVerifyJWT, createRoom);
router.route("/get-host-rooms").get(hostVerifyJWT, getHostRooms);
router.route("/get-room/:id").get(hostVerifyJWT, getHostRoomById);
router.route("/update-idp/:id").patch(hostVerifyJWT, updateIdp);
router.route("/get-idp/:id").get(hostVerifyJWT, getIdp);

export default router;