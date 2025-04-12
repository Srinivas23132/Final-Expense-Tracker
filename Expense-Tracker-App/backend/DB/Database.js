import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const db = process.env.MONGO_URL;
    if (!db) {
      console.error("MONGO_URL is not defined in environment variables.");
      process.exit(1);
    }
    // Connect to MongoDB with additional options
    const { connection } = await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected to ${connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
