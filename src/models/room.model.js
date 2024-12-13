import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomName: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  image: {
    type: String,
    required: true,
  },

  date: {
    type: String,
    required: true,
  },

  time: {
    type: String,
    required: true,
  },

  joinedTeam: {
    type: Number,
    required: true,
  },

  gameName: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ["Open", "Closed", "Live", "Upcoming"],
    default: "Upcoming",
  },

  tier: {
    type: String,
    enum: ["T3", "T2", "T1"],
    default: "T3",
  },

  maxTeam: {
    type: Number,
    required: true,
  },

  idp: [{
      id: {
        type: String,
        required: true,
      },
    },
    {
      password: {
        type: String,
        required: [true, "Password is required"],
      },
    }],
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
});

export const Room = mongoose.model("Room", roomSchema);
