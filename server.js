import { config } from 'dotenv';

config();
import { Telegraf } from "telegraf";
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

import connectDb from './src/config/db.js';
try {
    connectDb(process.env.MONGO_URI)
    console.log("database connected");
    
} catch (error) {
    console.error(error);
    process.kill(process.pid,"SIGTERM")
}
bot.start(async(ctx)=>{
    console.log('ctx',ctx);
    await ctx.reply("Welcome to PostGenie bot, How can i assist you?");
})

bot.launch();


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))