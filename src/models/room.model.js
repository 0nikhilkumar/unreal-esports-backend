import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomName: {
    type: String,
    required: true,
  },

  image: {
    type: String,
  },

  date: {
    type: String,
    required: true,
  },

  time: {
    type: String,
    required: true,
  },

  joinedTeam: [
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:'User'
    }
  ],

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

  prize: {
    type: Number,
  },
  idp: {
      id: {
        type: String,
      },
      password: {
        type: String,
      },
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Host",
  },
});

export const Room = mongoose.model("Room", roomSchema);
