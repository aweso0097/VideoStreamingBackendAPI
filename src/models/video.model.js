import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new mongoose.Schema (
    {
        owner : {
            type:Schema.Types.ObjectId,
            ref:"User",
            required: true,
        },
        videoFile: {
            type: String ,   //cloudinary url
            required:[true,"Video is required"],
        },
        thumbnail : {
            type:String,   //cloudinary url
            required:true
        },
        title : {
            type:String,   
            required:true
        },
        description: {
            type:String,   //cloudinary url
            required:true
        },
        duration: {
            type: Number,   //cloudinary
            required: true
        },
        views : {
            type: Number,
            default:0
        },
        isPublished: {
            type:Boolean
        }
    },
    {timestamps:true}
)
videoSchema.plugin(mongooseAggregatePaginate)


export const Video = mongoose.model ("Video",videoSchema)