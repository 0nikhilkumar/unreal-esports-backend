import { Api_Error } from "../utils/Api_Error.js";
import { Api_Response } from "../utils/Api_Response.js";
import {Room} from '../models/room.model.js'
import { Host } from "../models/host.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { io } from "../app.js";

export const createRoom = async (req, res) => {
  try {
    const {
      roomName,
      date,
      time,
      gameName,
      status,
      tier,
      maxTeam,
    } = req.body;
    console.log(roomName,
      date,
      time,
      gameName,
      status,
      tier,
      maxTeam,);

    if (
      [
        roomName,
        date,
        time,
        gameName,
        status,
        tier,
        maxTeam,
      ].some((field) => field?.trim() === "")) {
      throw new Api_Error(400, "All field are required");
    }

    const localRoomImage = req.file?.path;
    let roomImage;
    if(localRoomImage){
      roomImage = await uploadOnCloudinary(localRoomImage, "roomImages");

      if(!roomImage.url){
        throw new Api_Error(400, "roomImage not uploaded");
      }
    }

    const existedRoom = await Room.findOne({
        $and:[{roomName},{date},{time},{tier}]
    });

    if(existedRoom){
        throw new Api_Error(400,"Room already created")
    }
    
    const host = await Host.findById(req?.host?._id);
    if (!host) {
      throw new Api_Error(400, "Host not found");
    }

    const room = new Room({
      roomName,
      image: roomImage?.url || "",
      date,
      time,
      gameName,
      status,
      tier,
      maxTeam,
      hostId: req?.host?._id
    });

    const savedRoom = await room.save();

    if(!savedRoom){
        throw new Api_Error(400,"Room not created")
    }

    host.rooms.push(savedRoom._id);
    await host.save();

    io.emit("newRoom", room);
    
    res
      .status(201)
      .json(new Api_Response(201, "Room Created Successfully"));
  } catch (error) {
    throw new Api_Error(400, error.message);
  }
};

export const getHostRooms = async (req, res) => {
  try {
    const host = await Host.findById(req?.host?._id).populate("rooms");
    if (!host) {
      throw new Api_Error(400, "Host not found");
    }
    res.status(200).json(new Api_Response(200, "Host Rooms", host.rooms));
  } catch (error) {
    throw new Api_Error(400, error.message);
  }
}
