import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

const publishAVideo = asyncHandler(async(req,res) => {
    //in publishing a video we need --->
    //title,description
    //file,thumbnail
    //upload on cloudinary and store the urls in the mongoDB
    const {title,description} = req.body

    if(!title || !description) {
        throw new ApiError(400,"Title and Description are required")
    }
    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if(!videoLocalPath) {
        throw new ApiError(400,"Video File is required")
    }
    if(!thumbnailLocalPath) {
        throw new ApiError(400,"Thumbnail is required")
    }


    const videoUploadResponse = await uploadOnCloudinary(videoLocalPath)
    const thumbnailUploadResponse = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoUploadResponse.url) {
        throw new ApiError(501,"Error while uploading video url")
    }

    if(!thumbnailUploadResponse.url) {
        throw new ApiError(501,"Error while uploading thumbnail url")
    }

    const video = await Video.create({
        owner: req.user._id,
        title,
        description,
        videoFile:videoUploadResponse.url,
        thumbnail:thumbnailUploadResponse.url,
        duration:videoUploadResponse.duration,
        isPublished:true
    })

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            {video},
            "Video Uploaded Successfully"
        )
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId?.trim()) {
        throw new ApiError(400, "Video ID is missing");
    }

    
    await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: { views: 1 } 
        }
    );

    // 2. Fetch the video and populate the owner details
    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId) 
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner", // The field on the Video document
                foreignField: "_id", // The field on the User document
                as: "owner"
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner" 
                }
            }
        },
        {
            $project: {
                "owner.password": 0,
                "owner.refreshToken": 0
            }
        }
    ]);

    if (!video?.length) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video[0], 
                "Video Fetched Successfully"
            )
        );
});

const updateVideo = asyncHandler(async(req,res) => {
    const {title,description} = req.body
    const {videoId} = req.params

    if(!videoId) {
         throw new ApiError(400,"Video ID is missing")
    }

    const thumbnailLocalPath = req.file?.path

    if(!title && !description && !thumbnailLocalPath) {
        throw new ApiError(400,"No field provided for update")
    }

    const updateFields = {}
    if(title && title.trim() !== "") {
        updateFields.title = title
    }
    if(description && description.trim() !== "") {
        updateFields.description = description
    }
    if(thumbnailLocalPath) {
        const newThumbnailResponse = await uploadOnCloudinary(thumbnailLocalPath)
        if(!newThumbnailResponse) {
            throw new ApiError(400,"Error while uploading the thumbnail to cloudinary")
        }
        updateFields.thumbnail = newThumbnailResponse.url
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId, {
            $set: updateFields      
        },{new:true}
    )
    if(!updatedVideo) {
        throw new ApiError(404,"video Not Found")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedVideo,
            "Video details updated Successfully"
        )
    )
})

const deleteVideo = asyncHandler(async(req,res) => {
    const { videoId }= req.params
    if(!videoId) {
        throw new ApiError(400,"Video Id is missing")
    }
    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(404,"Video not found in database")
    }

    const videoPublicId = video.videoFile.split('/').pop().split('.')[0]
    const thumbnailPublicId = video.thumbnail.split('/').pop().split('.')[0]

    await deleteFromCloudinary(videoPublicId,"video")
    
    await deleteFromCloudinary(thumbnailPublicId,"image")

    await Video.findByIdAndDelete(videoId)

    return res
    .status(200)
    .json (
        new ApiResponse (
            200,
            {},
            "Video Deleted Successfully"
        )
    )
})

const getAllVideos = asyncHandler(async(req, res) => {
   
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    
    const pageNumber  = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    
    const matchConditions = {
        isPublished: true
    };

    if (userId) {
        matchConditions.owner = new mongoose.Types.ObjectId(userId);
    }

    if (query && query.trim() !== "") {
       matchConditions.$text = {$search : query.trim()}
    }

   
    const sortOptions = {};
    if (sortBy && sortType) {
        
        sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
    } else {

        sortOptions["createdAt"] = -1; 
    }

    
    const feed = await Video.aggregate([
        {
            $match: matchConditions
        },
        {
            $sort: sortOptions 
        },
        {
            $skip: skip
        },
        {
            $limit: limitNumber
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner" 
                }
            }
        },
        {
            $project: {
               
                "owner.password": 0,
                "owner.refreshToken": 0,
                "owner.email": 0
            }
        }
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                feed, 
                "Videos Feed fetched successfully"
            )
        );
});

export {publishAVideo
        ,getVideoById
        ,updateVideo
        ,deleteVideo
        ,getAllVideos
    }