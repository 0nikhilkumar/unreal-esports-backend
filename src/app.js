import { config } from "dotenv";
config({ path: "./.env" });
import express, { json, urlencoded } from "express"
import cookieParser from "cookie-parser"
import cors from 'cors'
import { Api_Error } from "./utils/Api_Error.js"
import {createServer} from "http"
import {Server} from "socket.io";
import jwt from "jsonwebtoken"


const app = express()
const httpServer = createServer(app)
export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});


// io.use((socket, next) => {
//   try {
//     const token = socket.handshake.auth?.accessToken || socket.handshake.headers?.authorization?.split(" ")[1];
  
//     if(!token){
//       return next(new Api_Error(401, "Authentication error"));
//     }
  
//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
  
//     if(!decoded){
//       return next(new Api_Error(401, "Authentication error"));
//     }
  
//     socket.user = decoded;
  
//     next();
//   } catch (error) {
//     next(error);
//   }
// });


io.on('connection', socket => {
  console.log('a user connected', socket.id);


  socket.on('disconnect', () => {
    console.log('A user disconnected', socket.id);  
  })
});

// NOTE: Middlewares
app.use(json({limit:'30kb'}))
app.use(urlencoded({extended:true,limit:'16kb'}))
app.use(cookieParser())
app.use(express.static("public"));

const corsOptions = {
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    credentials: true, 
  };


app.use(cors(corsOptions));


// INFO: Routes Import
import userRouter from "./routes/user.routes.js";
import roomRouter from "./routes/room.routes.js";
import hostRouter from "./routes/host.routes.js";


app.use('/api/v1/user', userRouter);
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