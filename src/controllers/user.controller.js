import { Api_Response } from "../utils/Api_Response.js";
import { Api_Error } from "../utils/Api_Error.js";
import { blacklistedtoken } from "../models/blacklistedtoken.model.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { Team } from "../models/team.model.js";
import { Room } from "../models/room.model.js";
import { Leaderboard } from "../models/leaderboard.model.js";
import crypto from "crypto";
import { sendMail } from "../utils/nodemailer.js";
import { Otp } from "../models/otp.model.js";

const generateTokens = async (id) => {
  const user = await User.findById(id);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

export const sendOTPToEmail = async (req, res) => {
  const { email, username } = req.body;
  if (!email || !username) {
    return res
      .status(400)
      .json(new Api_Response(400, "Please provide email and username"));
  }

  const isUserExisted = await User.findOne({ email });
  if (isUserExisted) {
    return res
      .status(400)
      .json(new Api_Response(400, "User already exists with this email"));
  }

  const otp = crypto.randomInt(1000, 9999).toString();
  try {
    const emailResponse = await sendMail(email, otp, username, "Sign Up");
    if (emailResponse) {
      const otpCreated = await Otp.create({
        email,
        otp,
        type: "signup",
      });

      if(!otpCreated){
        return res
        .status(500)
        .json(new Api_Error(500, "Internal Server Error")); 
      }

      return res
        .status(200)
        .json(new Api_Response(200, null, "OTP sent successfully"));
    }
  } catch (error) {
    return res
      .status(500)
      .json(new Api_Error(500, "Internal Server Error" || error.message));
  }
}

export const userSignup = async (req, res) => {
  try {
    const { username, email, password, otp } = req.body;

    if (!username || !email || !password || !otp) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Please fill all the fields",
        data: null
      });
    }

    const isUserExisted = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserExisted) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "User already exists",
        data: null
      });
    }

    const isOtpVerified = await Otp.findOne({ 
      email: email 
    }).sort({ createdAt: -1 });


    if (!isOtpVerified) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Your OTP is expired",
        data: null
      });
    }

    const receivedOtp = otp.toString();
    const storedOtp = isOtpVerified.otp.toString();

    if (receivedOtp !== storedOtp) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Please provide valid OTP",
        data: null
      });
    }

    const user = await User.create({
      username,
      email,
      password,
      isVerified: true
    });

    if (!user) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "User is not created",
        data: null
      });
    }

    await Otp.deleteOne({ _id: isOtpVerified._id });

    return res.status(201).json({
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: null
    });

  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || "Something went wrong",
      data: null
    });
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


export const getUserProfile = async(req,res) =>{
  const user = await User.findById(req.user._id).select("-password -refreshToken");
  if(!user){
    return res
    .status(400)
    .json(new Api_Response(400, "User not found"));
  }

  return res.json(new Api_Response(200, user, "User profile fetched successfully"));
}

export const updateUserProfile = async(req,res) =>{
  const {firstName, lastName, contact} = req.body;

  if(!firstName || !lastName || !contact){
    return res
    .status(400)
    .json(new Api_Response(400, "Please provide all the fields"));
  }

  const user = await User.findByIdAndUpdate(req.user._id, { firstName, lastName, contact },{new: true});

  if(!user){ 
    return res.json(new Api_Response(400, null, "User not updated"));
  }

  return res.json(new Api_Response(200, null, "User profile updated successfully"));

}

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
    if (!userId) {
      return res
        .status(400)
        .json(new Api_Response(400, null, "Unauthorized request"));
    }

    const isUserCreatedTeam = await Team.findOne({ userId });

    if (!isUserCreatedTeam) {
      return res
        .status(400)
        .json(new Api_Response(400, null, "Please create a team first"));
    }

    const roomId = req.body.id;
    if (!roomId) {
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
        .json(new Api_Response(403, null, "User already joined this room"));
    } else {
      const user = await User.findByIdAndUpdate(req.user._id, {
        $push: {
          joinedRooms: roomId,
        },
      });

      if (!user) {
        return res
          .status(400)
          .json(new Api_Response(400, null, "User not found"));
      }

      const getTeam = await Team.findOne({ userId: req.user._id });
      const addTeamInThatParticularRoom = await Room.findByIdAndUpdate(
        roomId,
        {
          $push: {
            joinedTeam: { teamId: getTeam._id },
          },
        },
        { new: true }
      );

      if (!addTeamInThatParticularRoom) {
        return res
          .status(400)
          .json(new Api_Response(400, null, "Something went wrong joining this room"));
      }

      // Logic to update `updateTeamTier`
      const roomHostId = addTeamInThatParticularRoom.hostId;
      if (roomHostId) {
        const isHostAlreadyAdded = getTeam.updateTeamTier.some(
          (tier) => tier.hostId.toString() === roomHostId.toString()
        );

        if (!isHostAlreadyAdded) {
          getTeam.updateTeamTier.push({
            hostId: roomHostId,
          });
          await getTeam.save();
        }
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


  res.status(201).json(new Api_Response(201, null, "Team updated successfully"));
};

export const updateSocialMediaLink = async (req, res) => {
  try {
    const userId  = req.user;  // Assuming userId is extracted from JWT
    const { socialMedia } = req.body;

    console.log(userId)
    // Check if userId exists in req.user
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User ID not found." });
    }

    // Validate request body: socialMedia should be an array with at least one entry
    if (!Array.isArray(socialMedia) || socialMedia.length === 0) {
      return res.status(400).json({ message: "Invalid social media data. Array is empty." });
    }

    // Validate each entry in the socialMedia array
    const allowedPlatforms = ["instagram", "youtube", "twitter"];
    for (const item of socialMedia) {
      if (!item.platform || !allowedPlatforms.includes(item.platform)) {
        return res.status(400).json({
          message: `Invalid platform: ${item.platform}. Allowed values: ${allowedPlatforms.join(", ")}`,
        });
      }
      if (!item.url || typeof item.url !== "string" || !/^https?:\/\/.+$/.test(item.url)) {
        return res.status(400).json({ message: "Each social media entry must have a valid URL." });
      }
    }

    // Update the user's social media links in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { socialMedia },  // Only update the socialMedia field
      { new: true, runValidators: true }  // Ensure validation is applied during update
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Social media links updated successfully",
      socialMedia: updatedUser.socialMedia,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getSocialMediaLinks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('socialMedia');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const socialMediaLinks = user.socialMedia.map(link => ({
      platform: link.platform,
      url: link.url
    }));

    res.status(200).json({
      socialMedia: socialMediaLinks
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching social media links', 
      error: error.message 
    });
  }
};


export const checkAuth = (req, res) => {
  return res.status(200).json({ isAuthenticated: true });
};

export const recentMatchLeaderboard = async (req, res) => {
  const {roomId} = req.body

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

  // if(!leaderboard){
  //   return res
  //   .status(400)
  //   .json(new Api_Response(400, "Leaderboard not found"));
  // }

  return res.status(200).json(new Api_Response(200, leaderboard, "Leaderboard fetched successfully"));

};

export const checkUsernameUnique = async (req, res) => {

  const {username} = req.query;

  if(!username){
    return res
    .status(400)
    .json(new Api_Response(400, "Username is required"));
  }

  const user = await User.findOne({username});

  if(user){
    return res
    .status(400)
    .json(new Api_Response(400, "Username already exists"));
  }

  return res.status(200).json(new Api_Response(200, "Username is unique"));
};


export const sendOTPToEmailForForgotPassword = async (req, res) => {
  const userId = req.user._id;
  if(!userId){
    throw new Api_Error(400, "unauthorized request");
  }

  const { email } = req.body;
  console.log(email);

  if (!email) {
    return res.status(400).json(new Api_Response(400, "Email is required"));
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json(new Api_Response(404, "User not found"));
  }

  if(user.email !== email){
    return res.status(403).json(new Api_Response(403, "Email does not match with the user"));
  }

  const otp = crypto.randomInt(1000, 9999).toString();
    try {
      const emailResponse = await sendMail(email, otp, user.username, "forgot");
      if (emailResponse) {
        const otpCreated = await Otp.create({
          email,
          otp,
          type: "password",
        });
  
        if(!otpCreated){
          return res
          .status(500)
          .json(new Api_Error(500, "Internal Server Error")); 
        }
  
        return res
          .status(200)
          .json(new Api_Response(200, null, "OTP sent successfully"));
      }
    } catch (error) {
      return res
        .status(500)
        .json(new Api_Error(500, "Internal Server Error" || error.message));
    }
};

export const verifyOTPForForgotPassword = async (req, res) => {
  const userId = req.user._id;
  if(!userId){
    throw new Api_Error(400, "unauthorized request");
  }

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json(new Api_Response(400, "Email and OTP are required"));
  }

  const user = await User.findById(userId);

  if(user.email !== email){
    return res.status(403).json(new Api_Response(403, "Email does not match with the user"));
  }

  const getOtp = await Otp.findOne({email});

  if(!getOtp || getOtp.otp !== otp){
    return res.status(403).json(new Api_Response(403, "Invalid OTP"));
  }

  return res.status(200).json(new Api_Response(200, null, "OTP verified successfully"));
};

export const forgotPassword = async (req, res) => {
  const userId = req.user._id;
  if(!userId){
    throw new Api_Error(400, "unauthorized request");
  }

  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    return res
      .status(400)
      .json(new Api_Response(400, "Email, password and confirm password are required"));
  }

  if (password !== confirmPassword) {
    return res
      .status(400)
      .json(new Api_Response(400, "Password and confirm password does not match"));
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json(new Api_Response(404, "User not found"));
  }

  if(user.email !== email){
    return res.status(403).json(new Api_Response(403, "Email does not match with the user"));
  }

  user.password = password;
  await user.save();

  return res.status(200).json(new Api_Response(200, null, "Password updated successfully"));
};