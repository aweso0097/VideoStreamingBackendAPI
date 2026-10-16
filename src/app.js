import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit: '16kb'}))
app.use(express.urlencoded({extended:true,limit: '16kb'}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRouter from './routes/user.routes.js'
import videoRouter  from'./routes/video.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import tweetRouter from './routes/tweet.route.js'
import likeRouter from './routes/like.routes.js'
import commentRouter from './routes/comment.route.js'
import playlistRouter from './routes/playlist.route.js'
import dashboardRouter from './routes/dashboard.routes.js'

//routes declarataion
app.use("/api/v1/users",userRouter);

app.use("/api/v1/videos",videoRouter);

app.use("/api/v1/subscriptions",subscriptionRouter);

app.use("/api/v1/tweets", tweetRouter);

app.use("/api/v1/like" , likeRouter);

app.use("/api/v1/comment" ,commentRouter);

app.use("/api/v1/playlist",playlistRouter);

app.use("/api/v1/stats",dashboardRouter);

export default app