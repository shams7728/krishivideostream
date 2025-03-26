const cloudinary = require("cloudinary").v2;
const Category = require("../models/category");

module.exports = (io) => {

    // Add Category
    const addCategory = async (req, res) => {
        try {
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ message: "Category name is required" });
            }

            const categoryExists = await Category.findOne({ name });
            if (categoryExists) {
                return res.status(400).json({ message: "Category already exists" });
            }

            let imageUrl = null;
            if (req.file) {
                const uploadedImage = await cloudinary.uploader.upload(req.file.path);
                imageUrl = uploadedImage.secure_url;
            }

            const category = new Category({ name, image: imageUrl });
            await category.save();

            io.emit("categoryAdded", category);
            res.status(201).json({ message: "Category added successfully", category });
        } catch (error) {
            res.status(500).json({ message: "Server Error", error: error.message });
        }
    };

    // Update Category
    const updateCategory = async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const category = await Category.findById(id);
            if (!category) return res.status(404).json({ message: "Category not found" });

            let imageUrl = category.image;
            if (req.file) {
                await cloudinary.uploader.destroy(category.image);
                const uploadedImage = await cloudinary.uploader.upload(req.file.path);
                imageUrl = uploadedImage.secure_url;
            }

            category.name = name || category.name;
            category.image = imageUrl;
            await category.save();

            io.emit("categoryUpdated", category);
            res.status(200).json({ message: "Category updated successfully", category });
        } catch (error) {
            res.status(500).json({ message: "Server Error", error: error.message });
        }
    };

    // Delete Category
    const deleteCategory = async (req, res) => {
        try {
            const { id } = req.params;
            const category = await Category.findById(id);
            if (!category) return res.status(404).json({ message: "Category not found" });

            await cloudinary.uploader.destroy(category.image);
            await Category.findByIdAndDelete(id);
            
            io.emit("categoryDeleted", { id });
            res.status(200).json({ message: "Category deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Server Error", error: error.message });
        }
    };

    // Get Categories
    const getCategories = async (req, res) => {
        try {
            const categories = await Category.find();
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({ message: "Server Error", error: error.message });
        }
    };

    return { addCategory, updateCategory, deleteCategory, getCategories };
};