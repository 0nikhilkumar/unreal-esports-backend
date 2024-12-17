import { Api_Error } from "../utils/Api_Error.js";
import { Api_Response } from "../utils/Api_Response.js";
import { Room } from "../models/room.model.js";
import { Host } from "../models/host.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { io } from "../app.js";

export const createRoom = async (req, res) => {
  const { roomName, date, time, gameName, status, tier, maxTeam, prize } =
    req.body;
  if (
    [roomName, date, time, gameName, status, tier, maxTeam, prize].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new Api_Error(400, "All field are required");
  }
  console.log(req.body);

  const localRoomImage = req.file?.path;
  let roomImage;
  if (localRoomImage) {
    roomImage = await uploadOnCloudinary(localRoomImage, "roomImages");
    // console.log(roomImage?.url);

    if (!roomImage?.url) {
      throw new Api_Error(400, "roomImage not uploaded");
    }
  }

  const existedRoom = await Room.findOne({
    $and: [{ roomName }, { date }, { time }, { tier }],
  });

  if (existedRoom) {
    throw new Api_Error(400, "Room already created");
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
    prize,
    hostId: req.user._id,
  });

  const savedRoom = await room.save();

  if (!savedRoom) {
    throw new Api_Error(400, "Room not created");
  }

  const host = await Host.findByIdAndUpdate(req.user._id, {
    $push: {
      roomsCreated: savedRoom._id,
    },
  });

  if (!host) {
    throw new Api_Error(400, "Host not found");
  }

  // host.rooms.push(savedRoom._id);
  // await host.save();

  io.emit("newRoom", room);

  res.status(201).json(new Api_Response(201, "Room Created Successfully"));
};

export const getHostRooms = async (req, res) => {
  try {
    const host = await Host.aggregate([
      { $match: { _id: req.user._id } },
      {
        $lookup: {
          from: "rooms",
          localField: "roomsCreated",
          foreignField: "_id",
          as: "roomDetails",
        },
      },
    ]);

    if (!host) {
      throw new Api_Error(400, "Host not found");
    }
    res.status(200).json(new Api_Response(200, "Host Rooms", host));
  } catch (error) {
    throw new Api_Error(400, error.message);
  }
};

export const getHostRoomById = async (req, res) =>{
  try {
    const id = req.params.id;
    if(!id){
      throw new Api_Error(400, "Please provide the id");
    }

    const host = await Host.findById(req.user._id);
    if(!host){
      throw new Api_Error(400, "Host not found");
    }

    const getRoom = await Room.findOne({_id: id, hostId: req.user._id});
    if(!getRoom){
      throw new Api_Error(400, "Room not found");
    }

    return res.status(200).json(new Api_Response(200, "Host Rooms", getRoom));
  } catch (error) {
    throw new Api_Error(400, error.message);
  }
};

export const updateIdp = async (req, res) => {
  const {roomId, roomPass} = req.body;  
  const {id}  = req.params

  if(!id){
    throw new Api_Error(400, "please provide roomID")
  }

  if(!roomId || !roomPass){
    throw new Api_Error(400,"All field are required")
  }

  const updatedIdp = await Room.findByIdAndUpdate(id,
    {
      idp:{
        id:roomId,
        password : roomPass
      }
    },
    {
      new:true
    }
  )

  if(!updatedIdp){
    throw new Api_Error(400,"RoomID and Password are not updated")
  }

  console.log(updatedIdp)

  return res.status(200).json(
    new Api_Response(200,updatedIdp,"RoomId and Password are Updated Successfully")
  )
}

export const getIdp = async(req,res)=>{
  const {id} = req.params
  if(!id){
    throw new Api_Error(400, "please provide roomID")
  }

  const {idp} =await Room.findById(id)

  if(!idp){
    throw new Api_Error(400,"RoomID and Password are not found")
  }

  return res.status(200).json(
    new Api_Response(200,idp,"Idp fetched Successfully")
  )

}
