const Video = require('../models/Video');
const cloudinary = require('../config/cloudinaryConfig');

module.exports = (io) => {

    // ✅ Upload a new video
    const uploadVideo = async (req, res) => {
        try {
            const { title, description, category } = req.body;
            const videoFile = req.files?.video;
            const thumbnailFile = req.files?.thumbnail;

            if (!videoFile || !thumbnailFile) {
                return res.status(400).json({ message: 'Video and Thumbnail are required.' });
            }

            // Upload video to Cloudinary
            const videoUpload = await cloudinary.uploader.upload(videoFile.tempFilePath, {
                resource_type: 'video',
                folder: 'videos'
            });

            // Upload thumbnail to Cloudinary
            const thumbnailUpload = await cloudinary.uploader.upload(thumbnailFile.tempFilePath, {
                folder: 'thumbnails'
            });

            // Save to MongoDB
            const newVideo = new Video({
                title,
                description,
                categoryId: category, // ✅ Store categoryId correctly
                videoUrl: videoUpload.secure_url,
                thumbnail: thumbnailUpload.secure_url,
                videoPublicId: videoUpload.public_id,  // ✅ Store video public_id
                thumbnailPublicId: thumbnailUpload.public_id  // ✅ Store thumbnail public_id
            });

            await newVideo.save();
            io.emit("videoAdded", newVideo);
            res.status(201).json({ message: 'Video uploaded successfully!', video: newVideo });

        } catch (error) {
            res.status(500).json({ message: 'Error uploading video', error: error.message });
        }
    };

    // ✅ Get all videos
    const getAllVideos = async (req, res) => {
        try {
            const videos = await Video.find();
            res.status(200).json(videos);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching videos', error: error.message });
        }
    };

    // ✅ Get video by ID
    const getVideoById = async (req, res) => {
        try {
            const video = await Video.findById(req.params.id);
            if (!video) return res.status(404).json({ message: 'Video not found' });
            res.status(200).json(video);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching video', error: error.message });
        }
    };

    // ✅ Update Video
    const updateVideo = async (req, res) => {
        try {
            const { id } = req.params;
            const { title, description, category } = req.body;

            const existingVideo = await Video.findById(id);
            if (!existingVideo) return res.status(404).json({ message: "Video not found" });

            let videoUrl = existingVideo.videoUrl;
            let thumbnailUrl = existingVideo.thumbnail;
            let videoPublicId = existingVideo.videoPublicId;
            let thumbnailPublicId = existingVideo.thumbnailPublicId;

            if (req.files) {
                if (req.files.video) {
                    if (videoPublicId) {
                        await cloudinary.uploader.destroy(videoPublicId, { resource_type: "video" });
                    }
                    const uploadedVideo = await cloudinary.uploader.upload(req.files.video.tempFilePath, { 
                        resource_type: "video", 
                        folder: "videos" 
                    });
                    videoUrl = uploadedVideo.secure_url;
                    videoPublicId = uploadedVideo.public_id;
                }

                if (req.files.thumbnail) {
                    if (thumbnailPublicId) {
                        await cloudinary.uploader.destroy(thumbnailPublicId);
                    }
                    const uploadedThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath, { 
                        folder: "thumbnails" 
                    });
                    thumbnailUrl = uploadedThumbnail.secure_url;
                    thumbnailPublicId = uploadedThumbnail.public_id;
                }
            }

            const updatedVideo = await Video.findByIdAndUpdate(
                id,
                { 
                    title, 
                    description, 
                    categoryId: category, // ✅ Correct field
                    videoUrl, 
                    thumbnail: thumbnailUrl, 
                    videoPublicId, 
                    thumbnailPublicId 
                },
                { new: true }
            );

            io.emit("videoUpdated", updatedVideo);
            res.status(200).json(updatedVideo);

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    // ✅ Delete Video
    const deleteVideo = async (req, res) => {
        try {
            const { id } = req.params;
            const video = await Video.findById(id);
            if (!video) return res.status(404).json({ message: "Video not found" });

            // 🔴 Ensure public_ids exist before deleting from Cloudinary
            if (video.videoPublicId) {
                await cloudinary.uploader.destroy(video.videoPublicId, { resource_type: "video" });
            }
            if (video.thumbnailPublicId) {
                await cloudinary.uploader.destroy(video.thumbnailPublicId);
            }

            await Video.findByIdAndDelete(id);
            
            io.emit("videoDeleted", { id });
            res.status(200).json({ message: "Video deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    return {
        uploadVideo,
        getAllVideos,
        getVideoById,
        updateVideo,
        deleteVideo
    };
};