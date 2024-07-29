import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const connectDb = async function(MongoURI){

try {
    const db = mongoose.connection;
    
    
    db.on('connected', () => {
        console.log('Connected to MongoDB server');
    });
    
    db.on('error', (err) => {
        console.error('MongoDB connection error:', err);
    });
    
    db.on('disconnected', () => {
        console.log('MongoDB disconnected');
    });
    
    await mongoose.connect(MongoURI);
    
   
} catch (error) {
    return res.status(404).json({"Error":"Server Issue"})
}
}

export default connectDb;