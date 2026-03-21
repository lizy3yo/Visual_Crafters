import mongoose from "mongoose";
import { buffer } from "stream/consumers";

// Extend the global namespace to include our mongoose connection
declare global {
    var _mongoose: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    };
}

// Ensure that the global mongoose variable is initialized only once
if (!global._mongoose) {
    global._mongoose = { conn: null, promise: null };
}

// Optional: You can add a helper function to disconnect from the database (useful for testing)
export async function connectDB() {
    
    // Check if there's an existing connection
    if (global._mongoose.conn) {
        return global._mongoose.conn;
    }

    // If there's no existing connection, create a new one
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined in environment variables");
    }

    // If there's no existing promise, create a new one to connect to the database
    if (!global._mongoose.promise) {
        const opts = {
            bufferCommands: false,
        };
        global._mongoose.promise = mongoose.connect(process.env.MONGODB_URI, opts);
    }

    // Await the connection promise and store the connection in the global variable
    try{
        global._mongoose.conn = await global._mongoose.promise;
        console.log("Connected to MongoDB");
        return global._mongoose.conn;
    }catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}