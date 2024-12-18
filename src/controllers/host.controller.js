import { Api_Response } from "../utils/Api_Response.js";
import { Api_Error } from "../utils/Api_Error.js";
import { Host } from "../models/host.model.js";
import { blacklistedtoken } from "../models/blacklistedtoken.model.js"
import jwt from "jsonwebtoken";

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
      req.vhost._id,
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