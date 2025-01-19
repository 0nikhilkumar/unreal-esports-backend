import { Host } from "../models/host.model.js";
import { Leaderboard } from "../models/leaderboard.model.js";
import { Room } from "../models/room.model.js";
import { User } from "../models/user.model.js";
import { Api_Error } from "../utils/Api_Error.js";
import { Api_Response } from "../utils/Api_Response.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createRoom = async (req, res) => {
  const {
    roomName,
    date,
    time,
    gameName,
    gameMap,
    status,
    tier,
    maxTeam,
    prize,
  } = req.body;
  if (
    [
      roomName,
      date,
      time,
      gameName,
      gameMap,
      status,
      tier,
      maxTeam,
      prize,
    ].some((field) => field?.trim() === "")
  ) {
    throw new Api_Error(400, "All field are required");
  }

  const existedRoom = await Room.findOne({
    $and: [{ roomName }, { date }, { time }, { tier }],
  });

  if (existedRoom) {
    throw new Api_Error(400, "Room already created");
  }

  const roomImageLocalPath = req.file?.path;
  console.log(roomImageLocalPath);
  let roomImage = null;
  if (roomImageLocalPath) {
    roomImage = await uploadOnCloudinary(roomImageLocalPath, "roomImages");

    if (!roomImage?.url) {
      throw new Api_Error(400, "roomImage not uploaded");
    }
  }

  const room = new Room({
    roomName,
    image: roomImage?.url || "",
    date,
    time,
    gameName,
    gameMap,
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

  // io.emit("newRoom", room);

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

export const getPreferredNameForRooms = async (req, res) => {
  const getHostPreferredNameData = await Host.find().select(
    "-password -refreshToken -roomsCreated"
  );

  if (!getHostPreferredNameData) {
    throw new Api_Error(400, "Host not found");
  }

  res
    .status(200)
    .json(
      new Api_Response(
        200,
        getHostPreferredNameData,
        "PreferredNames fetched Successfully"
      )
    );
};

export const getHostRoomById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new Api_Error(400, "Please provide the id");
    }

    const host = await Host.findById(req.user._id);
    if (!host) {
      throw new Api_Error(400, "Host not found");
    }

    const getRoom = await Room.findOne({
      _id: id,
      hostId: req.user._id,
    }).populate("joinedTeam.teamId");
    if (!getRoom) {
      throw new Api_Error(400, "Room not found");
    }

    return res.status(200).json(new Api_Response(200, "Host Rooms", getRoom));
  } catch (error) {
    throw new Api_Error(400, error.message);
  }
};

export const updateIdp = async (req, res) => {
  const { roomId, roomPass } = req.body;
  const { id } = req.params;

  if (!id) {
    throw new Api_Error(400, "please provide roomID");
  }

  // if (!roomId || !roomPass) {
  //   throw new Api_Error(400, "All field are required");
  // }

  const updatedIdp = await Room.findByIdAndUpdate(
    id,
    {
      idp: {
        id: roomId,
        password: roomPass,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedIdp) {
    throw new Api_Error(400, "RoomID and Password are not updated");
  }

  console.log(updatedIdp);

  return res
    .status(200)
    .json(
      new Api_Response(
        200,
        updatedIdp,
        "RoomId and Password are Updated Successfully"
      )
    );
};

export const getIdp = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    throw new Api_Error(400, "please provide roomID");
  }

  const room = await Room.findById(id);

  if (!room) {
    throw new Api_Error(400, "RoomID and Password are not found");
  }

  return res
    .status(200)
    .json(new Api_Response(200, room, "Idp fetched Successfully"));
};

export const getAllHostRooms = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new Api_Error(400, "Please provide the id");
  }

  const roomsCreated = await Host.findById(id)
    .populate("roomsCreated")
    .select("-password -refreshToken");
  if (!roomsCreated) {
    throw new Api_Error(400, "Room not found");
  }

  return res
    .status(200)
    .json(
      new Api_Response(200, roomsCreated, "All Rooms Fetched Successfully")
    );
};

export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id || !status) {
    return res
      .status(400)
      .json(new Api_Response(400, "Please provide the id and status"));
  }

  try {
    const roomStatus = await Room.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!roomStatus) {
      throw new Api_Error(400, "Room Status Not Found");
    }

    return res
      .status(200)
      .json(
        new Api_Response(200, roomStatus, "Room Status Updated Successfully")
      );
  } catch (error) {
    throw new Api_Error(400, error.message);
  }
};

export const deleteRoom = async (req, res) => {
  const { id } = req.params;

  // Check if roomId is provided
  if (!id) {
    return res.status(400).json(new Api_Error(400,"Room ID not found"));
  }

  try {
    // Attempt to delete the room
    const room = await Room.findByIdAndDelete(id);

    if (!room) {
      return res.status(404).json(new Api_Error(404, "Room not found"));
    }

    // Remove roomId from related models
    await Promise.all([
      User.updateMany({ roomId: id }, { $unset: { roomId: 1 } }),
      Host.updateMany({ roomId: id }, { $unset: { roomId: 1 } }),
      Leaderboard.updateMany({ roomId: id }, { $unset: { roomId: 1 } }),
    ]);

    return res
      .status(200)
      .json(
        new Api_Response(
          200,
          "All Room are deleted successfully"
        )
      );
  } catch (error) {
    console.error("Error deleting room or references:", error);
    return res
      .status(500)
      .json(new Api_Error(500, "Internal server error"));
  }
};
