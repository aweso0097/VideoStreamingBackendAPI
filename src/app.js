import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"
import ExpressMongoSanitize from "express-mongo-sanitize"

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))



// Create a rate limiter: Maximum 50 requests per 15 minutes per IP
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
    max: 50, // Limit each IP to 50 requests per windowMs
    message: {
        statusCode: 429,
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes."
    },
    standardHeaders: true, 
    legacyHeaders: false, 
});

// Apply the rate limiter to all API routes
app.use("/api/", apiLimiter);

app.use(express.json({limit: '16kb'}))
app.use(express.urlencoded({extended:true,limit: '16kb'}))
app.use(ExpressMongoSanitize())
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
import healthcheckRouter from './routes/healthcheck.route.js'

//routes declarataion
app.use("/api/v1/users",userRouter);

app.use("/api/v1/videos",videoRouter);

app.use("/api/v1/subscriptions",subscriptionRouter);

app.use("/api/v1/tweets", tweetRouter);

app.use("/api/v1/like" , likeRouter);

app.use("/api/v1/comment" ,commentRouter);

app.use("/api/v1/playlist",playlistRouter);

app.use("/api/v1/stats",dashboardRouter);

app.use("/api/v1/healthcheck",healthcheckRouter);

export default app