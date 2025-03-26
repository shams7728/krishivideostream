require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cloudinary = require("./config/cloudinaryConfig");
const videoRoutes = require("./routes/videoRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const server = http.createServer(app);

// ✅ Use environment variable for IP address & PORT
const HOST = process.env.HOST || "0.0.0.0"; // Default to 0.0.0.0 (listens on all interfaces)
const PORT = process.env.PORT || 5000;

// ✅ WebSocket Setup
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
    },
});

io.on("connection", (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});

// ✅ Middleware Setup
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 400 * 1024 * 1024 } // ✅ Increases limit to 50MB
}));
app.use(express.json({ limit: '100mb' })); 
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// ✅ MongoDB Connection
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("❌ MONGO_URI is missing in .env file!");
        }
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB Connection Failed:", err);
        process.exit(1);
    }
};
connectDB();

// ✅ Routes
app.use("/api/videos", videoRoutes(io));
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);

// ✅ Default Route
app.get("/", (req, res) => {
    res.send("🎥 Video Streaming API with WebSocket is Running...");
});

// ✅ Start Server
server.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on https://krishivideostream.onrender.com:${PORT}`);
});
