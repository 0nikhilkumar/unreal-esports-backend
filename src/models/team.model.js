import { model, Schema } from "mongoose";

const teamSchema = new Schema({
  teamName: {
    type: String,
    required: [true, "Team name is required"],
    unique: true,
    index: true,
    trim: true,
  },

  player1OwnerIGN: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  player1OwnerID: {
    type: Number,
    required: true,
    unique: true,
    trim: true,
  },
  player2IGN: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  player2ID: {
    type: Number,
    required: true,
    unique: true,
    trim: true,
  },
  player3IGN: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  player3ID: {
    type: Number,
    required: true,
    unique: true,
    trim: true,
  },
  player4IGN: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  player4ID: {
    type: Number,
    required: true,
    unique: true,
    trim: true,
  },
  player5IGN: {
    type: String,
    unique: true,
    trim: true,
  },
  player5ID: {
    type: Number,
    unique: true,
    trim: true,
  },
});

export const Team = new model("Team", teamSchema);
