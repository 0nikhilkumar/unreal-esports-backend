import { Api_Response } from "../utils/Api_Response.js";
import { Api_Error } from "../utils/Api_Error.js";
import { blacklistedtoken } from "../models/blacklistedtoken.model.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { Team } from "../models/team.model.js";
import { Room } from "../models/room.model.js";
import { Leaderboard } from "../models/leaderboard.model.js";

const generateTokens = async (id) => {
  const user = await User.findById(id);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

export const userSignup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.json(new Api_Response(400, "Please fill all the fields"));
    }

    const isUserExisted = await User.findOne({
      $or: [{ username }, { email }],
    });

    if(isUserExisted){
      return res.json(new Api_Response(403, "User already exists"));
    }

    const user = await User.create({
      username,
      email,
      password,
      isVerified: true
    });

    if (!user) {
      return res.status(403).json(new Api_Response(403, "User is not created"));
    }

    return res
      .status(201)
      .json(new Api_Response(201, "User registered successfully"));

  } catch (error) {
    return res
      .status(500)
      .json(new Api_Error(500, error.message || "Something went wrong"));
  }
};

export const userLogin = async (req, res) => {
  const { username, email, password } = req.body;
  if (!(username || email) || !password) {
    return res
      .status(400)
      .json(new Api_Response(400, "Please fill all the fields"));
  }

  const isUserExisted = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!isUserExisted) {
    return res.status(409).json(new Api_Response(409, "User does not exists"));
  }

  const isCorrectPassword = await isUserExisted.isPasswordCorrect(password);
  if (!isCorrectPassword) {
    return res
      .status(409)
      .json(new Api_Response(403, "Invalid user credentials"));
  }

  const { accessToken, refreshToken } = await generateTokens(isUserExisted._id);

  const getUser = await User.findById(isUserExisted._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new Api_Response(200,{accessToken, user: getUser}, "User login successfully"));
};

export const logout = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, 
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  const token = req.cookies.accessToken;
  await blacklistedtoken.create({ token });

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new Api_Response(200, null, "User logged Out"));
};

export const refreshAccessToken = async (req, res) => {
  const bodyRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!bodyRefreshToken) {
    return res
      .status(401)
      .json(new Api_Error(401, "Unauthorized request"));
  }
  try {
    const decodeToken = jwt.verify(
        bodyRefreshToken,
      process.env.REFRESH_TOKEN_SECRET_KEY
    );
    const user = await User.findById(decodeToken?._id);
    if (!user) {
      return res
        .status(401)
        .json(new Api_Error(401, "Invalid refresh token"));
    }
    console.log("hlw");

    if (bodyRefreshToken !== user?.refreshToken) {
      return res
        .status(401)
        .json(new Api_Error(401, "", "Invalid refresh token"));
    }
    const options = {
      httpOnly: true,
      secure: true,
    };

    const { refreshToken, accessToken } = await generateTokens(user._id);

    return res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new Api_Response(
          200,
          { accessToken, refreshToken},
          "Access token refreshed"
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new Api_Response(500, "Internal Server Error" || error.message));
  }
};

export const userJoinRoom = async (req, res) => {
  try {
    const userId = req.user._id;
    if(!userId){
      return res
      .status(400)
      .json(new Api_Response(400, null, "Unauthorized request"));
    }
    
    const isUserCreatedTeam = await Team.findOne({userId});

    if(!isUserCreatedTeam){
      return res
      .status(400)
      .json(new Api_Response(400, null, "Please create team first"));
    }

    const roomId = req.body.id;
    if(!roomId){
      return res
      .status(400)
      .json(new Api_Response(400, null, "Please provide roomID"));
    }

    const userAlreadyInJoinedRooms = await User.findOne({
      _id: req.user._id,
      joinedRooms: { $elemMatch: { $eq: roomId } },
    });

    if (userAlreadyInJoinedRooms) {
      return res
      .status(403)
      .json(new Api_Response(403, null, "User Already joined this room"));;
    }
    else {
      const user = await User.findByIdAndUpdate(req.user._id, {
        $push: {
          joinedRooms: roomId,
        }
      });
  
      if(!user){
        return res
        .status(400)
        .json(new Api_Response(400, null, "User not found"));
      }

      const getTeam = await Team.findOne({userId: req.user._id});

      const addTeamInThatParticularRoom = await Room.findByIdAndUpdate(
        roomId,
        {
          $push: {
            joinedTeam: { teamId: getTeam._id },
          },
        },
        { new: true } 
      );

      if(!addTeamInThatParticularRoom){
        return res
        .status(400)
        .json(new Api_Response(400, null, "Something went wrong join this room"));  
      }
    }

    return res
      .status(200)
      .json(new Api_Response(200, null, "User joined room successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new Api_Response(500, "Internal Server Error" || error.message));
  }
};

export const getAllUserJoinedRooms = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if(!user){
      return res
      .status(400)
      .json(new Api_Response(400, "User not found"));
    }

    const {joinedRooms} = await User.findById(user._id).populate({
      path: "joinedRooms",
      populate: {
        path: "hostId",
        select: "preferredName"
      },
      populate:{
        path:"joinedTeam.teamId",
        select:"teamName"
      }
    });

    return res
      .status(200)
      .json(new Api_Response(200, joinedRooms, "All Rooms Fetched Successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new Api_Response(500, "Internal Server Error" || error.message));
  }
};

export const getHostRoomById = async (req, res) =>{
    const id = req.params.id;
    if(!id){
      throw new Api_Error(400, null, "Please provide the id");
    }


    const user = await User.findById(req.user._id);
    if(!user){
      throw new Api_Error(400,null, "User not found");
    }

    const getRoom = await Room.findById(id).populate({
      path: "joinedTeam.teamId",
      select: "_id ",
      populate: {
        path: "userId",
        select:"_id"
      }
    });

    if(!getRoom){
      throw new Api_Error(400,null, "Room not found");
    }

    return res.status(200).json(new Api_Response(200, getRoom, "Host Room"));

};

export const createTeam = async (req, res)=> {

  const userId = req.user._id;
    if(!userId){
      return res
      .status(400)
      .json(new Api_Response(400, "Unauthorized request"));
  }

  const { teamName, players } = req.body;

  if(!teamName || !players){
    return res
    .status(400)
    .json(new Api_Response(400, "TeamName or players are required"));
  }

  const newTeam = new Team({
    teamName,
    players,
    userId: req.user._id,
  });

  await newTeam.save();

  res.status(201).json({ message: "Team created successfully"});
};

export const getUserTeam = async (req, res) => {

  const userId = req.user._id;
  if(!userId){
    return res
    .status(400)
    .json(new Api_Response(400, "Unauthorized request"));
  }
  
  const getTeam = await Team.findOne({userId});

  // if(!getTeam){
  //   return res
  //   .status(400)
  //   .json(new Api_Response(400, "Team not found"));  
  // }

  return res
  .status(200)
  .json(new Api_Response(200, getTeam, "Team fetched successfully"));
};

export const updateTeam = async (req, res) => {

  const userId = req.user._id;
  if(!userId){
    return res
    .status(400)
    .json(new Api_Response(400, null, "Unauthorized request"));
  }

  const { teamName, players } = req.body;

  const getTeam = await Team.findOne({userId});

  if(!getTeam){
    return res
    .status(400)
    .json(new Api_Response(400, null, "Team not found"));  
  }

  await Team.findByIdAndUpdate(getTeam._id,{
    teamName,
    players,
  }, {new: true});


  res.status(201).json({ message: "Team Updated successfully"});
};


export const checkAuth = (req, res) => {
  return res.status(200).json({ isAuthenticated: true });
};


export const recentMatchLeaderboard = async (req, res) => {
  const {roomId} = req.body

  console.log(roomId)
  
  if(!roomId){
    return res
    .status(400)
    .json(new Api_Response(400, "RoomId is required"));
  } 



  const leaderboard = await Leaderboard.findOne({roomId}).populate(
    {
      path: "leaderboardData.teamId",
      select:"teamName -_id"
    }
  )

  if(!leaderboard){
    return res
    .status(400)
    .json(new Api_Response(400, "Leaderboard not found"));
  }

  return res.status(200).json(new Api_Response(200, leaderboard, "Leaderboard fetched successfully"));

}