import { config } from 'dotenv';
import User from './src/models/User.js'
import {message} from 'telegraf/filters'

config();
import { Telegraf } from "telegraf";
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

import connectDb from './src/config/db.js';
try {
    connectDb(process.env.MONGO_URI)
    
    
} catch (error) {
    console.error(error);
    process.kill(process.pid,"SIGTERM")
}
bot.start(async (ctx) => {
    const from = ctx.update.message.from;

    console.log('from', from);

    try{
        await User.findOneAndUpdate({tgId:from.id},{
            $setOnInsert:{
                firstName:from.firstName,
                lastName:from.lastName,
                username:from.username,
                isBot:from.isBot
            }
        },{
            upsert:true,
            new:true
        })

        await ctx.reply(`Hey ${from.first_name}, Welcome to PostGenieBot! I'm here to help you create engaging content for your social media posts. Just keep feeding me your events that happened throughout your day.`);
    }

     catch (error) {
        console.error('Error in /start command:', error);
        await ctx.reply('Sorry for the inconvenience, facing some difficulties at this moment.');
    }
});

bot.on(message('text'),async(ctx)=>{
    ctx.reply('Got the message')
})
bot.launch();


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))