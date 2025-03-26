const errorHandler = (err, req, res, next) => {
    console.error("🔥 Server Error:", err); // ✅ Log full error details
  
    res.status(err.statusCode || 500).json({
      message: err.message || "Server error",
      error: err.stack || {}, // ✅ Send full error stack in development
    });
  };
  
  module.exports = errorHandler;
  