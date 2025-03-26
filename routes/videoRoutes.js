const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController"); // Import function

module.exports = (io) => {
    const { uploadVideo, getAllVideos, getVideoById, updateVideo, deleteVideo } = videoController(io); // ✅ Pass io

    router.post("/", uploadVideo);  // ✅ Fix the upload route
    router.get("/", getAllVideos);
    router.get("/:id", getVideoById);
    router.put("/:id", updateVideo);
    router.delete("/:id", deleteVideo);

    return router;
};
