import mongoose from "mongoose";

const hostChangeTeamRankSchema = new mongoose.Schema({
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Host",
        required: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    rank: {
        type: String,
        enum: ["T3", "T2", "T1"],
        default: "T3",
    }
}, {timestamps: true});

export const HostChangeTeamRank = mongoose.model("HostChangeTeamRank", hostChangeTeamRankSchema);