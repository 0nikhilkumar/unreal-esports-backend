import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import express, { json, urlencoded } from "express";
import helmet from "helmet";
import { createServer } from "http";
import { Server } from "socket.io";
import { Api_Error } from "./utils/Api_Error.js";
config({ path: "./.env" });

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});


const roomUsers = {};

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    if (!roomUsers[roomId]) {
      roomUsers[roomId] = new Set();
    }
    roomUsers[roomId].add(socket.id);
    io.to(roomId).emit('online-users', Math.abs(roomUsers[roomId].size-1));
    console.log(`User joined room ${roomId}. Total users: ${Math.abs(roomUsers[roomId].size-1)}`);
  });

  socket.on('room-create', (data) => {
    socket.to(data.roomId).emit('room-update', data);
    console.log('Room created/updated:', data);
  });

  socket.on('toggle-status', (data) => {
    socket.to(data.id).emit('updated-status', data);
    console.log('Room status updated', data);
  });

  socket.on('leave-room', (roomId) => {
    leaveRoom(socket, roomId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    for (const roomId in roomUsers) {
      if (roomUsers[roomId].has(socket.id)) {
        leaveRoom(socket, roomId);
      }
    }
  });
});

function leaveRoom(socket, roomId) {
  if (roomUsers[roomId]) {
    roomUsers[roomId].delete(socket.id);
    socket.leave(roomId);
    io.to(roomId).emit('online-users',Math.abs(roomUsers[roomId].size-1));
    console.log(`User left room ${roomId}. Total users: ${Math.abs(roomUsers[roomId].size-1)}`);
    if (roomUsers[roomId].size === 0) {
      delete roomUsers[roomId];
    }
  }
}

// NOTE: Middlewares
app.use(json({ limit: "30kb" }));
app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(helmet());

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

app.use(cors(corsOptions));

// INFO: Routes Import
import hostRouter from "./routes/host.routes.js";
import roomRouter from "./routes/room.routes.js";
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/rooms", roomRouter);
app.use("/api/v1/host", hostRouter);

// centralized error handling
app.use((err, req, res, next) => {
  if (err instanceof Api_Error) {
    // Send the error to Postman
    res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
    });
  } else {
    // Handle other unknown errors
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// export default app

export default httpServer;
