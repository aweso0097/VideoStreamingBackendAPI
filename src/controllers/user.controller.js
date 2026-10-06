import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import  uploadOnCloudinary   from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from  "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new Error(`User ${userId} was not found while generating tokens`)
        }
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()     

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken,refreshToken}
    }
    catch (error) {
        console.error("Token generation failed:", error)
        throw new ApiError (500,"Something went wrong while generating access and refresh Tokens")
    }
}

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
        

        if(!fullName  || fullName.trim() == "" || !email || email.trim() == ""
            || !username || username.trim() == "" || !password || password.trim() == "") {
            throw new ApiError(400,"All fields are required")
        }
        const existedUser = await User.findOne({
            $or: [{username}, {email}]
        })
        if(existedUser) {
            throw new ApiError(409,"Username or Email already Exists");
        }
        // console.log(req.files);

       const avatarLocalPath = req.files?.avatar?.[0]?.path;
       const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar File is required");
    }

    const avatarUploadResponse = await uploadOnCloudinary(avatarLocalPath);
    const coverImageUploadResponse = coverImageLocalPath
        ? await uploadOnCloudinary(coverImageLocalPath)
        : null;

            const user = await User.create({
                fullName,
                avatar:avatarUploadResponse.url,
                coverImage:coverImageUploadResponse?.url || "",
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

const loginUser = asyncHandler(async (req,res) => {
    //req body -> data
    //check if registered or not->email or username should be in db
    //grant access token and generate refresh token
    //send cookies

    const {email,username,password} = req.body

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user) {
        throw new ApiError(400,"User does not exist")
    }

    const passwordCheck = await user.isPasswordCorrect(password)

    if(!passwordCheck) {
         throw new ApiError(401,"Password is incorrect")
    }

    const {refreshToken,accessToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json (
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "Logged in Successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
            {
                new:true
            }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res 
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(
        200,
        {},
        "LogOut Successfully"
    ))
})

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(401, "unauthorised request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new ApiError(401,"invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(404,"Refresh token is expired")
        }
    
        const options = {
            httpOnly:true,
            secure:true
        }
        const {accessToken,refreshToken: newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res 
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json (
            new ApiResponse (
                200,
                {accessToken,newRefreshToken},
                "Access Token Refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,"Access Token Expired")
    }
})

export {registerUser,
        loginUser,
        logoutUser,
        refreshAccessToken
}
