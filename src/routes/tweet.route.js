import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, updateTweet } from "../controllers/tweet.controller.js";

const router = Router();

router.route('/create').post(verifyJWT,createTweet)

router.route('/update/:tweetId').patch(verifyJWT,updateTweet)

export default router