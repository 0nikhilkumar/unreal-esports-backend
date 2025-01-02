import express from "express";
import { createRoom, getAllHostRooms, getHostRoomById, getHostRooms, getIdp, getPreferredNameForRooms, updateIdp, updateStatus } from "../controllers/room.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { hostVerifyJWT } from "../middlewares/hostAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
// import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.route("/create-room").post(hostVerifyJWT, upload.single("image"), createRoom);
router.route("/get-host-rooms").get(hostVerifyJWT, getHostRooms);
router.route("/getHostRoom").get(verifyJWT, getHostRooms);
router.route("/get-room/:id").get(hostVerifyJWT, getHostRoomById);
router.route("/update-idp/:id").patch(hostVerifyJWT, updateIdp);
router.route("/get-idp/:id").get(hostVerifyJWT, getIdp);
router.route("/update-status/:id").patch(hostVerifyJWT, updateStatus);
router.route("/user-get-idp/:id").get(verifyJWT, getIdp);
router.route("/get-preferredName").get(getPreferredNameForRooms);
router.route("/getAllHostRooms/:id").get(getAllHostRooms);


export default router;