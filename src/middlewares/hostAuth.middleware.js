import { Host } from "../models/host.model.js";
import jwt from "jsonwebtoken";
import { Api_Error } from "../utils/Api_Error.js";
import { blacklistedtoken } from "../models/blacklistedtoken.model.js";

export const hostVerifyJWT = async (req, _, next) => {
  const token =
    req.cookies?.accessToken || req.headers?.authorization?.split(" ")[1];

  if (!token) {
    throw new Api_Error(401, "Unauthorized request");
  }

  const isBlacklisted = await blacklistedtoken.find({ token });

  if (isBlacklisted.length) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  const decodedTokenInformation = jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET_KEY
  );

  const host = await Host.findById(decodedTokenInformation?._id).select(
    "-password -refreshToken"
  );

  if (!host) {
    return res.status(401).json(new Api_Error(401, "Unauthorized request"));
  }

  req.user = host;
  next();
};
