import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
    {
        video : {
            type : mongoose.schema.types.ObjectId,
            ref : "Video"
        },
        comment : {
            type : mongoose.schema.types.ObjectId,
            ref : "Comment"
        },
        tweet : {
            type : mongoose.schema.types.ObjectId,
            ref : "Tweet"
        },
        likedBy : {
            type : mongoose.schema.types.ObjectId,
            ref : "User"
        }
    },
    {timestamps:true}
)

export const Like = mongoose.model("Like",likeSchema);