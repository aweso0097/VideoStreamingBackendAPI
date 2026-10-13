import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async(req , res ) => {
    const owner = req.user._id
    
    const {content} = req.body

    if(!content.trim()) {
        throw new ApiError(400,"Content is missing")
    }

    const post =  await Tweet.create({
        content: content,
        owner : owner
    })

    return res
    .status(201)
    .json (
        new ApiResponse(
            201,
            post,
            "Tweet created successfully"
        )
    )
})

const updateTweet = asyncHandler(async(req , res ) => {
    const {tweetId} = req.params
    const {content} = req.body

    if(!content ||!content.trim()) {
        throw new ApiError(400,"Content is missing")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet) {
        throw new ApiError(404,"Tweet id is missing")
    }

    if(tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permisssions to edit this field")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            content: content
        },
        {new : true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse (
        200,
        updatedTweet,
        "Tweet updated successfully"
        )
    )
})

const deleteTweet = asyncHandler(async(req , res) => {
    const {tweetId} = req.params
    const tweet = await Tweet.findById(tweetId)
    if(!tweet) {
        throw new ApiError(400,"Tweet not found")
    }
    //authorize before delete
    if(tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403,"You are not authorised to delete this field")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Tweet deleted successfully"
        )
    )

})

const getUserTweets = asyncHandler(async(req , res) => {
    const {userId} = req.params;
    const { page  = 1,limit = 5} = req.query;

    if(!userId) {
        throw new ApiError(400, "User id is missing");
    }

    const pageNumber = parseInt(page,10)
    const limitNumber = parseInt(limit,10)

    const skip = (pageNumber - 1) * limitNumber

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $sort : {
                createdAt : -1
            }
        },
        {
            $skip : skip
        },
        {
            $limit : limitNumber
        },
        {
            $lookup : {
                from  : "users",
                localField : "owner",
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
                "owner.password" : 0,
                "owner.email" : 0,
                "owner.refreshToken" :0
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweets,
            "Tweets feed fetched successfully"
        )
    )
})

export {createTweet
        ,updateTweet
        ,deleteTweet
        ,getUserTweets
    }