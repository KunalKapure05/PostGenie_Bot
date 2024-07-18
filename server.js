import dotenv from 'dotenv';
import connectDb from './src/config/db.js';
import bot from './src/bot.js'
dotenv.config();

try {
    connectDb(process.env.MONGO_URI)
    
    
} catch (error) {
    console.error(error);
    process.kill(process.pid,"SIGTERM")
}














bot.launch();


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))