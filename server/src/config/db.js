const mongoose = require("mongoose");

async function connectDB() {
  const uri =
    process.env.MONGODB_URI ||
    "mongodb+srv://ravisachin957_db_user:Sachin%409570@cluster0.i7ptlxz.mongodb.net/collabboard";
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("✅ MongoDB connected", uri);
}

module.exports = { connectDB };
