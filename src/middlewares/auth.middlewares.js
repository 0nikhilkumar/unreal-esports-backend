import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { Api_Error } from "../utils/Api_Error.js";

export const verifyJWT = async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      throw new Api_Error(401, "Unauthorized request");
    }

    const decodedTokenInformation = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET_KEY
    );

    const user = await User.findById(decodedTokenInformation?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(401).json(new Api_Error(401, "Unauthorized request"));
    }

    req.user = user;
    next();
  } catch (error) {
    throw new Api_Error(401, error?.message || "Invalid access token");
  }
};
