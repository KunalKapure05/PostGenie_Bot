import { config } from 'dotenv';
import User from './src/models/User.js'
import {message} from 'telegraf/filters'
import Event from './src/models/Events.js'

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

bot.command('generate',async(ctx)=>{
    const from = ctx.update.message.from;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // set to midnight

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // set to end of day
   
    //get events from that user
    const events = await Event.find({
        tgId:from.id,
        createdAt:{
            $gte: startOfDay,
            $lte: endOfDay // today
        }
    })

    if(events.length === 0 ){
        await ctx.reply("No events found in the last 24 hours");
        return;
    }
    console.log('events',events);
    //make openai api call
    //store token count
    //send response
    await ctx.reply("doing things")
})
bot.on(message('text'),async(ctx)=>{
    const from = ctx.update.message.from;
    const message = ctx.update.message.text;

    try {
        await Event.create({
            text:message,
            tgId : from.id
        })

        await ctx.reply(
            `Noted , keep texting me your thoughts. to generate the posts,juat enter the command : /generate`
        )
    } catch (error) {
        console.error(error);
        await ctx.reply(' facing some difficulties at this moment, please try again');

        
    }
   
})


bot.launch();


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))