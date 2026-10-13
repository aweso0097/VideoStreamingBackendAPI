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
export {createTweet
        ,updateTweet
        ,deleteTweet
    }