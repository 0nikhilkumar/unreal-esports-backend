import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { Api_Error } from "../utils/Api_Error.js";
import { blacklistedtoken } from "../models/blacklistedtoken.model.js";

export const verifyJWT = async (req, res, next) => {
  console.log("hi1");
  const token =
    req.cookies?.accessToken || req.headers?.authorization?.split(" ")[1];

  if (!token) {
    throw new Api_Error(401, "Unauthorized request");
  }
  console.log("hi2");
  const isBlacklisted = await blacklistedtoken.find({ token });

  if (isBlacklisted.length) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
  console.log("hi3")

  const decodedTokenInformation = jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET_KEY
  );
  console.log("hi4")

  const user = await User.findById(decodedTokenInformation?._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    return res.status(401).json(new Api_Error(401, "Unauthorized request"));
  }
  console.log("hi5")


  req.user = user;
  next();
};
