import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import  uploadOnCloudinary   from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req,res) => {
   //get user details from frontend
   //validation -> !empty
   //check if user already exist:username/email
   //check for images,check for avatar
   //upload to cloudinary
   //create a user object ->create entry in db
   //remove password and refresh token field from response
   //check for user creation
   //return response

   const {fullName,email,username,password} = req.body
        console.log("email: ",email);

        if(!fullName  || fullName.trim() == "" || !email || email.trim() == ""
            || !username || username.trim() == "" || !password || password.trim()) {
            throw new ApiError(400,"All fields are required")
        }
        const existedUser = User.findOne({
            $or: [{username}, {email}]
        })
        if(existedUser) {
            throw new ApiError(409,"Username or Email already Exists");
        }


        const avatarLocalPath = req.files?.avatar[0]?.path;
        const coverImageLocalPath = req.files?.coverImage[0]?.path;

        if(!avatarLocalPath) {
            throw new ApiError(400,"Avatar File is required")
        }
        const avatarUploadResponse = await uploadOnCloudinary(avatarLocalPath)
        const localImageUploadResponse = await uploadOnCloudinary(coverImageLocalPath)

        if(!avatarUploadResponse) {
            throw new ApiError(500,"Avatar could not be uploaded")
        }

        const user = await User.create({
            fullName,
            avatar:avatarUploadResponse.url,
            coverImage:localImageUploadResponse?.url || "",
            email,
            password,
            username
        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if(!createdUser) {
            throw new ApiError(500,"Server side error while registering user")
        }

        return res.status(201).json(
            new ApiResponse(200,createdUser,"User Registered Successfully")
        )
})



export {registerUser}