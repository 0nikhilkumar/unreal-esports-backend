import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  leaderboardData: [
    {
      _id: false,
      teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true,
      },
      finishes: {
        type: Number,
        required: true,
      },
      placePts: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
        required: true,
      },
    },
  ],
});

export const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);
