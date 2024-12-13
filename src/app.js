import express, { json, urlencoded } from "express"
import cookieParser from "cookie-parser"
import cors from 'cors'

const app = express()

// NOTE: Middlewares
app.use(json({limit:'16kb'}))
app.use(urlencoded({extended:true,limit:'16kb'}))
app.use(cookieParser())

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

app.use('/api/v1/users', userRouter);
app.use("/api/v1/rooms", roomRouter);
app.use("/api/v1/host", hostRouter);

export default app