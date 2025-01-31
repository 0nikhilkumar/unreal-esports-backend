import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const hostSchema = new Schema(
  {
    preferredName: {
      type: String,
      unique: true,
      required: [true, "Preferred name is required"],
    },
    username: {
      type: String,
      unique: true,
      required: [true, "Username is required"],
      index: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },

    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    contact: {
      type: String,
    },
    socialMedia: [
      {
        platform: {
          type: String,
          enum: ["instagram", "youtube", "twitter"],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],

    refreshToken: {
      type: String,
    },

    roomsCreated: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      },
    ],
  },
  {
    timestamps: true,
  }
);

hostSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

hostSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

hostSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      preferredName: this.preferredName,
    },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
    }
  );
};

hostSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET_KEY,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
    }
  );
};

export const Host = new model("Host", hostSchema);
