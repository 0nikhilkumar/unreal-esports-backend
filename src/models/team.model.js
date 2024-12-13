import { model, Schema } from "mongoose";

const teamSchema = new Schema({
  teamName: {
    type: String,
    required: [true, "Team name is required"],
    unique: true,
    index: true,
    trim: true,
  },

  member: [
    {
      teamId: {
        type: String,
        required: [true, "Id is required"],
        unique: true,
      },

      ign: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        lowercase: true,
        required: [true, "Email is required"],
        unique: true,
      },
    },
  ],
});

export const Team = new model("Team", teamSchema);
