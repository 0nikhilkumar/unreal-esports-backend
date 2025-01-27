import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        otp: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ["signup", "password"],
            required: true
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => Date.now() + 10 * 60 * 1000
        }
    },
    { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model("Otp", otpSchema);