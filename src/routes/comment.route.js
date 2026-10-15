import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";




const router = Router();

router.route("/v/:videoId").post(verifyJWT,addComment)

router.route("/c/:commentId").patch(verifyJWT,updateComment)

router.route("/c/:commentId").delete(verifyJWT,deleteComment)

router.route("/:videoId").get(getVideoComments)

export default router