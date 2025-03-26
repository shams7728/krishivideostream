const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String }, // Store image URL
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
