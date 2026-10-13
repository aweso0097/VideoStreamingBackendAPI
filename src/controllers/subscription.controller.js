import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

export { toggleSubscription };