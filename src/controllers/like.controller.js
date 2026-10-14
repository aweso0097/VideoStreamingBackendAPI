import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { mongoose } from "mongoose";

const toggleVideoLike = asyncHandler(async(req , res ) => {
    const userId = req.user._id
    const {videoId} = req.params

    if(!videoId) {
        throw new ApiError (400, "Video Id is missing")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy : userId
    })

    if(!existingLike) {
        const like = await Like.create ({
            video : videoId,
            likedBy : userId
        })
        return res
        .status(200)
        .json (
            new ApiResponse (
                200,
                like,
                "Liked"
            )
        )
    } 
    else {
        await Like.findByIdAndDelete (existingLike._id);
        return res
        .status(200)
        .json (
            new ApiResponse (
                200,
                {},
                "Unliked"
            )
        )
    }
})

const toggleCommentLike = asyncHandler(async(req , res ) => {
    const userId = req.user._id
    const {commentId} = req.params

    if(!commentId) {
        throw new ApiError (400, "Comment Id is missing")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy : userId
    })

    if(!existingLike) {
        const like = await Like.create ({
            comment : commentId,
            likedBy : userId
        })
        return res
        .status(200)
        .json (
            new ApiResponse (
                200,
                like,
                "Liked"
            )
        )
    } 
    else {
        await Like.findByIdAndDelete (existingLike._id);
        return res
        .status(200)
        .json (
            new ApiResponse (
                200,
                {},
                "Unliked"
            )
        )
    }
})

const toggleTweetLike = asyncHandler(async(req , res ) => {
    const userId = req.user._id
    const {tweetId} = req.params

    if(!tweetId) {
        throw new ApiError (400, "Tweet Id is missing")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy : userId
    })

    if(!existingLike) {
        const like = await Like.create ({
            tweet: tweetId,
            likedBy : userId
        })
        return res
        .status(200)
        .json (
            new ApiResponse (
                200,
                like,
                "Liked"
            )
        )
    } 
    else {
        await Like.findByIdAndDelete (existingLike._id);
        return res
        .status(200)
        .json (
            new ApiResponse (
                200,
                {},
                "Unliked"
            )
        )
    }
})

const getLikedVideos = asyncHandler(async(req,res) => {
    const userId = req.user._id;

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: {
                    $exists: true
                }
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "video",
                foreignField : "_id",
                as: "likedVideo"
            }
        },
        {
            $addFields : {
                likedVideo : {
                    $first : "$likedVideo"
                }
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "likedVideo.owner",
                foreignField : "_id",
                as : "owner"
            }
        },
        {
            $addFields : {
                owner : {
                    $first : "$owner"
                }
            }
        },
        {
            $project : {
                "owner.email" : 0,
                "owner.password" : 0,
                "owner.refreshToken" : 0
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse (
            200,
            likedVideos,
            "Liked videos fetched successfully"
        )
    )
})


export {toggleVideoLike
        ,toggleCommentLike
        ,toggleTweetLike
        ,getLikedVideos
}