import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id; 

    if (!channelId) {
        throw new ApiError(400, "Channel ID is missing");
    }

    // 1. Check if subscription already exists
    const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    });

    // 2. Toggle Logic
    if (existingSubscription) {
        // Unsubscribe: Delete the document using its _id
        await Subscription.findByIdAndDelete(existingSubscription._id);

        return res.status(200).json(
            new ApiResponse(200, {}, "Unsubscribed successfully")
        );
    } else {
        // Subscribe: Create the new document
        const newSubscription = await Subscription.create({
            subscriber: userId,
            channel: channelId
        });

        return res.status(200).json(
            new ApiResponse(200, newSubscription, "Subscribed successfully")
        );
    }
});

const getUserChannelSubscribers = asyncHandler(async (req,res) => {
    const { channelId } = req.params

    if(!channelId) {
        throw new ApiError (400,"Channel Id is missing")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match : {
                channel : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "subscriber",
                foreignField : "_id",
                as : "subscriber"
            }
        },
        {
            $addFields : {
                subscriber : {
                    $first: "$subscriber"
                }
            }
        },
        {
            $project : {
                "subscriber.password" : 0,
                "subscriber.email" : 0,
                "subscriber.refreshToken" : 0
            }
        }
    ])
    return res
    .status (200)
    .json (
        new ApiResponse(
            200,
            subscribers,
            "Subscribers Fetched Successfully"
        )
    )
})

const getSubscribedChannels = asyncHandler(async (req,res) => {
    const {subscriberId} = req.params

    if(!subscriberId) {
        throw new ApiError(400,"Subscriber Id is missing")
    }
    const subscribed = await Subscription.aggregate([
        {
            $match: {
                subscriber : new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "channel",
                foreignField: "_id",
                as : "subscribedChannel"
            }
        },
        {
            $addFields: {
                subscribedChannel : {
                    $first : "$subscribedChannel"
                }
            }
        },
        {
            $project : {
                "subscribedChannel.password" : 0,
                "subscribedChannel.email" : 0,
                "subscribedChannel.refreshToken" : 0
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscribed,
            "Subscription list fetched successfully"
        )
    )
})

export { toggleSubscription
        ,getUserChannelSubscribers
        ,getSubscribedChannels
    };