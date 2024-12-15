import { Api_Response } from "../utils/Api_Response.js";
import { Api_Error } from "../utils/Api_Error.js";
import { blacklistedtoken } from "../models/blacklistedtoken.model.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

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
    .json(new Api_Response(200, getUser, "User login successfully"));
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

  const token = req.cookies.token;
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
      .json(new Api_Response(500, "Something went wrong" || error.message));
  }
};
