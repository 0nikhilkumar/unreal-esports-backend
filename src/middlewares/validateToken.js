import jwt from "jsonwebtoken";
import { Api_Response } from "../utils/Api_Response.js";
import { Api_Error } from "../utils/Api_Error.js";

export const validateProtectedToken = (req, res) => {
    const token  = req.headers.authorization?.split(' ')[1];
    console.log(token)
    if (!token) {
        throw new Api_Error(404, "Token is required");
    }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    return res
      .status(200)
      .json(new Api_Response(200, decoded, "Token is valid"));
  } catch (error) {
    throw new Api_Error(401, "Token is invalid");
  }
};
