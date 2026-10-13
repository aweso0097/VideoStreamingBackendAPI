import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, updateTweet } from "../controllers/tweet.controller.js";

const router = Router();

router.route('/create').post(verifyJWT,createTweet)

router.route('/update/:tweetId').patch(verifyJWT,updateTweet)

router.route('/:tweetId').delete(verifyJWT,deleteTweet)

export default router