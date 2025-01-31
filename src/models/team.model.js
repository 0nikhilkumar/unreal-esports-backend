import mongoose, { model, Schema } from "mongoose";

const teamSchema = new Schema({
  teamName: {
    type: String,
    required: [true, "Team name is required"],
    unique: true,
    index: true,
  },
  players: [
    {
      _id:false,
      
      playerNumber: {
        type: Number,
        required: true,
      },
      ign: {
        type: String,
        unique: true,
        sparse: true, // Ensures uniqueness at the database level
        default: null,
      },
      igId: {
        type: Number,
        unique: true,
        sparse: true, // Ensures uniqueness at the database level
        default: null,
      },
      email: {
        type: String,
        unique: true,
        sparse: true, // Ensures uniqueness at the database level
        default: null,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"], // Email validation
      },
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  updateTeamTier:[
    {
      hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Host",
      },
      tier:{
        type: String,
        enum: ["T3", "T2", "T1"],
        default: "T3"
      },
      _id:false
    }
  ]


});


teamSchema.index(
  { "players.ign": 1 },
  { unique: true, partialFilterExpression: { "players.ign": { $ne: null } } }
);

teamSchema.index(
  { "players.igId": 1 },
  { unique: true, partialFilterExpression: { "players.igId": { $ne: null } } }
);

teamSchema.index(
  { "players.email": 1 },
  { unique: true, partialFilterExpression: { "players.email": { $ne: null } } }
);

// Middleware for validation
teamSchema.pre("save", function (next) {
  const players = this.players || [];
  
  // Validate player data
  players.forEach((player) => {
    if (player.playerNumber !== 5) {
      if (!player.ign || !player.igId || !player.email) {
        return next(new Error(`ign, igId, and email are required for players other than Player 5`));
      }
    }
  });
  next();
});


export const Team = new model("Team", teamSchema);
