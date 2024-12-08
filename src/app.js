import express, { json, urlencoded } from "express"
import cookieParser from "cookie-parser"

const app = express()

// NOTE: Middlewares
app.use(json({limit:'16kb'}))
app.use(urlencoded({extended:true,limit:'16kb'}))
app.use(cookieParser())


// INFO: Routes Import
import userRouter from "./routes/user.routes.js"

app.use('/api/v1/users', userRouter)


export default app