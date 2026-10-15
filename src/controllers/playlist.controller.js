import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import  mongoose  from "mongoose";

const createPlaylist = asyncHandler(async (req , res) => {
    const {name,description} = req.body;

    if(!name || !name.trim()) {
        throw new ApiError(400,"Playlist name is required")
    }

    if(!description || !description.trim()) {
        throw new ApiError(400,"Playlist description is required")
    }

    const playlist = await Playlist.create( {
        name : name,
        description : description,
        owner : req.user._id
    })
    return res
    .status(201)
    .json(
        new ApiResponse (
            201,
            playlist,
            "Playlist created successfully"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async( req , res) => {
    const {playlistId} = req.params
    const {videoId} = req.params;

    const existingPlaylist = await Playlist.findById(playlistId)
    
    if(!existingPlaylist) {
        throw new ApiError(404,"Playlist not found")
    }

    if(existingPlaylist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403,"You are not authorised")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        $addToSet : {
            videos : videoId
        }
    },{new : true})

    return res
    .status(200)
    .json (
        new ApiResponse (
            200,
            updatedPlaylist,
            "Video added to the playlist successfully"
        )
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req , res) => {
    const {playlistId} = req.params
    const {videoId} = req.params;

    const existingPlaylist = await Playlist.findById(playlistId)
    
    if(!existingPlaylist) {
        throw new ApiError(404,"Playlist not found")
    }

    if(existingPlaylist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403,"You are not authorised")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        $pull : {
            videos : videoId
        }
    },{new : true})
    return res
    .status(200)
    .json (
        new ApiResponse (
            200,
            updatedPlaylist,
            "Video removed from playlist successfully"
        )
    )
})



export {createPlaylist
        ,addVideoToPlaylist
        ,removeVideoFromPlaylist
    }