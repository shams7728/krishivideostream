const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    videoUrl: { type: String, required: true },
    thumbnail: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Video", videoSchema);
