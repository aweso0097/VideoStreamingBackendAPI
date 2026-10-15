import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import  mongoose, { trusted }  from "mongoose";

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

const getUserPlaylists = asyncHandler(async(req , res) => {
    const {userId} = req.params;

    if(!userId) {
        throw new ApiError(400,"User id is missing")
    }

    const playlists = await Playlist.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(userId)
            }
        },
    ])
    return res
        .status(200)
        .json (
            new ApiResponse(
                200,
                playlists,
                "Playlists fetched successfully"
            )
        )
})

const getPlaylistById = asyncHandler(async(req , res) => {
    const { playlistId } = req.params

    if(!playlistId) {
        throw new ApiError(400,"Playlist id is missing")
    }

    const playlist = await Playlist.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "videos",
                foreignField : "_id",
                as : "videos"
            }
        }, 
        {
            $lookup : {
                from : "users",
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
                "owner.email" : 0,
                "owner.password" : 0,
                "owner.refreshToken" : 0
            }
        }
    ])
    if(!playlist?.length) {
        throw new ApiError (404, "Playlist not found")
    }

    return res 
    .status(200)
    .json (
        new ApiResponse (
            200,
            playlist[0],
            "Playlist fetched successfully"
        )
    )
})

const updatePlaylist = asyncHandler(async (req , res) => {
    const {playlistId} = req.params;

    const {name,description} = req.body;

    if(!name || !name.trim()) {
        throw new ApiError (400,"Playlist name is required")
    }

    if(!description || !description.trim()) {
         throw new ApiError (400,"Description is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist) {
        throw new ApiError (404,"Playlist could not be found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403,"You are not authorized")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId , 
        {
            $set : {
                name : name,
                description : description
            }
        },
        {new : true}
    )
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Playlist updated successfully"
            )
        )
});

const deletePlaylist = asyncHandler (async ( req , res) => {
    const {playlistId} = req.params;

    const playlist = await Playlist.findById(playlistId)

    if(!playlist) {
        throw new ApiError (404,"Playlist could not be found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403,"You are not authorized")
    }


    await Playlist.findByIdAndDelete(playlistId)

    return res
    .status(200)
    .json(
        new ApiResponse (
            200,
            {},
            "Playlist deleted successfully"
        )
    )


})

export {createPlaylist
        ,addVideoToPlaylist
        ,removeVideoFromPlaylist
        ,getUserPlaylists
        ,getPlaylistById
        ,updatePlaylist
        ,deletePlaylist
    }