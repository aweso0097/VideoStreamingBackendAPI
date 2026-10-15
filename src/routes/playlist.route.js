import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, removeVideoFromPlaylist } from "../controllers/playlist.controller.js";



const router = Router();


router.route("/").post(verifyJWT,createPlaylist)

router.route("/add/:videoId/:playlistId").patch(verifyJWT,addVideoToPlaylist)

router.route("/remove/:videoId/:playlistId").patch(verifyJWT,removeVideoFromPlaylist)

export default router;