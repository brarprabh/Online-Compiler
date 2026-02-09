const mongoose = require('mongoose');
// for connecting the db
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            // These options ensure compatibility with modern MongoDB
        });
        console.log("✅ MongoDB Connected Successfully");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1); // Stop the app if DB fails
    }
};

module.exports = connectDB;