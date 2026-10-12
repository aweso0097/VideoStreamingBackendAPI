import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

 // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        // console.log("Successfully Uploaded File On Cloudinary",response.url);
        fs.unlinkSync(localFilePath)
        return response;
    }
    catch(error) {
        fs.unlinkSync(localFilePath)   //remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    try {
        if (!publicId) return null;
        // Cloudinary uploader destroy method requires the public_id and the resource_type (image, video, raw)
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        return response;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        return null;
    }
};

export {uploadOnCloudinary,
        deleteFromCloudinary
    }