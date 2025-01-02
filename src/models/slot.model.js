import mongoose from "mongoose";

export const slotSchema = new mongoose.Schema({
    slot: {
        type: String,
    },
    teamId: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "Team",
    },
    roomId: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "Room",
    }
}, {timestamps: true});