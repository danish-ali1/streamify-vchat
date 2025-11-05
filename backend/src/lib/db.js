import mongoose from 'mongoose';

export const connectDb= async () =>{
    try {
       const conn= await mongoose.connect(process.env.MONGO_URI,{
           serverSelection: {
               family: 4 // This is the fix!
           }
       });
       console.log(`MongoDB connected to ${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }   
}

