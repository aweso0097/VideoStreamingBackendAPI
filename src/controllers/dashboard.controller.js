import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";

const getChannelStats = asyncHandler(async(req , res) => {
    const userId = req.user._id;
    
    const totalSubscribers = await Subscription.countDocuments(
        {
            channel : userId
        }
    )

    const totalVideos = await Video.countDocuments (
        {
        owner : userId
        }
    )

    const videoStats = await Video.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup : {
                from : "likes",
                localField : "_id",
                foreignField : "video",
                as: "likes"
            }
        },
        {
            $project : {
                views : 1,
                likesCount : {$size : "$likes"}
            }
        },
        {
            $group : {
                _id : null,
                totalViews : {$sum : "$views"},
                likesCount : {$sum : "$likesCount"}
            }
        }
    ])
    const stats = {
        totalSubscribers,
        totalVideos,
        totalViews : videoStats[0]?.totalViews || 0,
        likesCount : videoStats[0]?.likesCount || 0
    }

    
    return res
    .status(200)
    .json(
        new ApiResponse (
            200,
            stats,
            "Channel stats fetched successfully"
        )
    )
})

export {getChannelStats}
