import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { mongoose } from "mongoose";

const addComment = asyncHandler(async (req , res) => {
    const userId = req.user._id;
    const {videoId} = req.params;
    const {content} = req.body;

    if(!videoId) {
        throw new ApiError(400,"Video id is missing");
    }

    if(!content || !content.trim()) {
        throw new ApiError(400,"Content is missing")
    }

    const comment = await Comment.create({
        content : content,
        owner : userId,
        video : videoId
    })
    return res
    .status(201)
    .json (
        new ApiResponse (
            201,
            comment,
            "Commented successfully"
        )
    )
})

const updateComment = asyncHandler(async(req , res) => {
    const {commentId} = req.params;
    const {content} = req.body

    if(!content ||!content.trim()) {
        throw new ApiError(400,"Content is missing")
    }

   const comment = await Comment.findById(commentId)

   if(!comment) {
    throw new ApiError(404,"Comment could not be found")
   }

   if(comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403,"You are not authorized to update this field")
   }

    const updatedComment =   await Comment.findByIdAndUpdate(commentId,
        {
            content : content
        },
        { new : true}
    )
    return res
    .status(200)
    .json (
        new ApiResponse(
            200,
            updatedComment,
            "Comment updated successfully"
        )
    )
}) 

const deleteComment = asyncHandler(async (req , res) => {
    const {commentId} = req.params

    const existingComment = await Comment.findById(commentId)

    if(!existingComment) {
        throw new ApiError(404,"Comment could not be found")
    }

    if(existingComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403,"You are not authorized to delete this field")
    }

    await Comment.findByIdAndDelete(commentId);

    return res
    .status(200)
    .json(
        new ApiResponse (
            200,
            {},
            "Comment deleted successfully"
        )
    )
})

const getVideoComments = asyncHandler(async (req , res) => { 
    const {videoId} = req.params

    const{page =1 , limit = 10} = req.query;

    if(!videoId) {
        throw new ApiError(400, " Video Id is missing")
    }

    const pageNumber = parseInt(page,10);
    const limitNumber = parseInt(limit,10);

    const skip = (pageNumber-1)*limitNumber

    const comments = await Comment.aggregate([
        {
                $match : {
                    video : new mongoose.Types.ObjectId(videoId)
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
                from : "users",
                localField : "owner",
                foreignField: "_id",
                as : "commenter"
            }
        },
        {
            $addFields : {
                commenter : {
                    $first : "$commenter"
                }
            }
        },
        {
            $project : {
                "commenter.email" : 0,
                "commenter.password" : 0,
                "commenter.refreshToken" : 0
            }
        }
    ])
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comments,
                "Video comments fetched successfully"
            )
        );
})

export {addComment
        ,updateComment
        ,deleteComment
        ,getVideoComments
        }