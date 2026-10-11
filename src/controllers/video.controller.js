import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";

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
        duration:videoUploadResponse.duration
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

export {publishAVideo}