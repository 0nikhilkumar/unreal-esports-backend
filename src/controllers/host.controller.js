import { Api_Response } from "../utils/Api_Response.js";
import { Api_Error } from "../utils/Api_Error.js";
import { Host } from "../models/host.model.js";
import { blacklistedtoken } from "../models/blacklistedtoken.model.js"
import jwt from "jsonwebtoken";
import { Room } from "../models/room.model.js";
import mongoose from "mongoose";
import { Leaderboard } from "../models/leaderboard.model.js";

const generateTokens = async (id) => {
  const host = await Host.findById(id);
  const accessToken = host.generateAccessToken();
  const refreshToken = host.generateRefreshToken();

  host.refreshToken = refreshToken;
  await host.save();

  return { accessToken, refreshToken };
};

export const register = async (req, res) => {
    try {
      const { username, email, password, preferredName } = req.body;
  
      if (!username || !email || !password || !preferredName) {
        return res.json(new Api_Response(400, "Please fill all the fields"));
      }
  
      const isHostExisted = await Host.findOne({
        $or: [{ username }, { email }],
      });
  
      if(isHostExisted){
        return res.json(new Api_Response(403, "Host already exists"));
      }
  
      const host = await Host.create({
        username,
        email,
        password,
        preferredName,
      });
  
      if (!host) {
        return res.status(403).json(new Api_Response(403, "Host is not created"));
      }
  
      return res
        .status(201)
        .json(new Api_Response(201, host, "Host registered successfully"));
  
    } catch (error) {
        return res
            .status(500)
            .json(new Api_Error(500, error.message || "Something went wrong"));
    }
};

export const login = async (req, res) => {
    const { username, email, password } = req.body;
    if (!(username || email) || !password) {
      return res
        .status(400)
        .json(new Api_Response(400, "Please fill all the fields"));
    }
  
    const isHostExisted = await Host.findOne({
      $or: [{ username }, { email }],
    });
  
    if (!isHostExisted) {
      return res.status(409).json(new Api_Response(409, "Host does not exists"));
    }
  
    const isCorrectPassword = await isHostExisted.isPasswordCorrect(password);
    if (!isCorrectPassword) {
      return res
        .status(409)
        .json(new Api_Response(403, "Invalid host credentials"));
    }
  
    const { accessToken, refreshToken } = await generateTokens(isHostExisted._id);
  
    const getHost = await Host.findById(isHostExisted._id).select(
      "-password -refreshToken"
    );
  
    const options = {
      httpOnly: true,
      secure: true,
    };
  
    return res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new Api_Response(200, { getHost, accessToken }, "Host login successfully"));
};
  
export const logout = async (req, res) => {
    await Host.findByIdAndUpdate(
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
        .json(new Api_Response(200, null, "Host logged Out"));
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
      const host = await Host.findById(decodeToken?._id);
      if (!host) {
        return res
          .status(401)
          .json(new Api_Error(401, "Invalid refresh token"));
      }
  
      if (bodyRefreshToken !== host?.refreshToken) {
        return res
          .status(401)
          .json(new Api_Error(401, "", "Invalid refresh token"));
      }
      const options = {
        httpOnly: true,
        secure: true,
      };
  
      const { refreshToken, accessToken } = await generateTokens(host._id);
  
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
        .json(new Api_Response(500, "Something went wrong" || error.message));
    }
};

export const updateSlotToTeam = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json(new Api_Error(400, "Please provide the room id"));
  }

  const { teams } = req.body;
  console.log(teams);

  if (!Array.isArray(teams) || teams.length === 0) {
    return res.status(400).json(new Api_Error(400, "Please provide valid team data"));
  }

  try {
    // Iterate through each team in the array
    for (const team of teams) {
      if (!team.teamId || !team.slot) {
        return res
          .status(400)
          .json(new Api_Error(400, "Each team object must have teamId and slot"));
      }

      // Update the specific team in the joinedTeam array
      const updatedRoom = await Room.findByIdAndUpdate(
        id,
        {
          $set: {
            "joinedTeam.$[elem].slot": team.slot, // Set the slot where teamId matches
          },
        },
        {
          new: true, // Return the updated document
          arrayFilters: [{ "elem.teamId": new mongoose.Types.ObjectId(team.teamId) }], // Correctly create ObjectId
        }
      );

      console.log(updatedRoom);

      // If room is not found or update fails, return an error
      if (!updatedRoom) {
        return res.status(404).json(new Api_Error(404, "Room not found"));
      }
    }

    // Respond with success
    return res.status(200).json({ message: "Slots updated successfully" });
  } catch (error) {
    console.error("Error updating slots:", error);
    return res
      .status(500)
      .json(new Api_Error(500, "An error occurred while updating slots"));
  }
};

export const updateLeaderboardData = async (req, res) => {
  const { id } = req.params;
  const { leaderboardData } = req.body;

  if (!id || !leaderboardData || !Array.isArray(leaderboardData)) {
    return res
      .status(400)
      .json({ error: "Please provide a valid room ID and leaderboard data." });
  }

  const getRoom = await Room.findById(id);
  if(!getRoom){
    return res.status(404).json({ error: "Room not found" });
  }

  try {
    // Find the leaderboard for the given roomId
    const existingLeaderboard = await Leaderboard.findOne({roomId: id });

    if (existingLeaderboard) {
      // Update existing data or add new data
      leaderboardData.forEach((entry) => {
        const existingEntryIndex = existingLeaderboard.leaderboardData.findIndex(
          (data) => data.teamId.toString() === entry.teamId
        );

        if (existingEntryIndex !== -1) {
          // Update existing entry
          existingLeaderboard.leaderboardData[existingEntryIndex] = {
            ...existingLeaderboard.leaderboardData[existingEntryIndex],
            ...entry, // Merge new data with existing data
          };
        } else {
          // Add new entry if teamId is not found
          existingLeaderboard.leaderboardData.push(entry);
        }
      });

      // Save the updated leaderboard
      const updatedLeaderboard = await existingLeaderboard.save();
      return res.status(200).json({
        message: "Leaderboard updated successfully.",
        data: updatedLeaderboard,
      });
    } else {
      // Create a new leaderboard
      const newLeaderboard = new Leaderboard({
        roomId: id,
        leaderboardData,
      });
      const leaderboard = await newLeaderboard.save();
      getRoom.leaderboard = leaderboard._id;
      await getRoom.save();
      return res.status(201).json({
        message: "Leaderboard created successfully.",
      });
    }
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating the leaderboard." });
  }
};

export const getUpdateLeaderboardData = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Please provide a valid room ID." });
  }

  try {
    // Find the leaderboard for the given id
    const leaderboard = await Leaderboard.findOne({ roomId: id });

    if (leaderboard) {
      return res.status(200).json({ leaderboard });
    } else {
      return res.status(404).json({ error: "Leaderboard not found." });
    }
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the leaderboard." });
  }
};

export const checkAuth = (req, res) => {
  return res.status(200).json({ isAuthenticated: true });
};


