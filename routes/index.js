const express = require("express");
const categoryRoutes = require("./categoryRoutes");
const videoRoutes = require("./videoRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.use("/categories", categoryRoutes);
router.use("/videos", videoRoutes);
router.use("/users", userRoutes);

module.exports = router;
