import { User } from "../models/user.model";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"


 const verifyJWT = asyncHandler(async (req,res,next) => {
    try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

    if(!token) {
        throw new ApiError(401,"Unauthorized Request")
    }

    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

    const user = User.findById(decodedToken?._id.select("-password -refreshToken"))

    if(!user) {
        throw new ApiError(401,"Invalid Access Token")
    }

    req.user = user;
    next();
    }
    catch(error) {
        throw new ApiError (401, "Invalid Access Token")
    }
})

export {verifyJWT}











