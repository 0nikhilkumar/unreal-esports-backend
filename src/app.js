import express, { json, urlencoded } from "express"
import cookieParser from "cookie-parser"
import cors from 'cors'
import {createServer} from "http"
import {Server} from "socket.io"

const app = express()
const httpServer = createServer(app)
export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

// NOTE: Middlewares
app.use(json({limit:'16kb'}))
app.use(urlencoded({extended:true,limit:'16kb'}))
app.use(cookieParser())
app.use(express.static("public"));

const corsOptions = {
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    credentials: true, 
  };


app.use(cors(corsOptions));

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("login", (data)=> {
    console.log(data);
  })

  socket.on("disconnect", ()=> {
    console.log("A user disconnected", socket.id);
  })
});


// INFO: Routes Import
import userRouter from "./routes/user.routes.js";
import roomRouter from "./routes/room.routes.js";
import hostRouter from "./routes/host.routes.js";
import { Api_Error } from "./utils/Api_Error.js"

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