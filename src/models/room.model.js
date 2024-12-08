import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    roomId: {
      type: String,
      required: true  
    },
    roomName: {
        type: String,
        required: true,
        unique: true,
        index:true
    },
    image: {
        type: String,
        required: true
    },
    date: {
        type: Number,
        required: true
    },
    time: {
        type: String,        
        required: true
    },
    capacity: {
        type: String,
        required: true
    },
    gameName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Open", "Closed", "Live"],
        default: "Open"
    },
    maxTeam: {
        type: Number,
        required: true
    },
});


export const Room = mongoose.model('Room', roomSchema);