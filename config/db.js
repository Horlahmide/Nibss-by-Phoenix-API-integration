import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  // Check if an existing connection is active (1 = connected, 2 = connecting)
  if (mongoose.connection.readyState >= 1) {
    console.log("MongoDB is already connected. Reusing existing connection.");
    return mongoose.connection;
  }

  try {
    const mongoUri =
      process.env.MONGO_DB_URI || "mongodb://localhost:27017/nibbs";

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
export { connectDB };
