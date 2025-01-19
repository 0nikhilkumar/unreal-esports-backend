import { Schema, model } from "mongoose";

const deleteRoomSchema = new Schema(
  {
    hostId: {
      type: Schema.Types.ObjectId,
      ref: "Host",
    },
    deletedRoom:[
        {
            type: Schema.Types.ObjectId,
            ref: "Room"
        }
    ]
  },
  {
    timestamps: true,
  }
);

export const DeleteRoom = new model("DeleteRoom", deleteRoomSchema);
