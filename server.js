import { config } from 'dotenv';
import userModel from './src/models/User.js'

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
bot.start(async(ctx)=>{
    const from = ctx.update.message.from;

    console.log('from',from);

    try {
        await userModel.findOneandUpdate({tgId:from.id},{
            $setOnIsert : {
                firstName : from.firstName,
                lastName : from.lastName,
                username : from.username,
                isBot: from.isBot
            }
        },{
            upsert: true,
            new: true
        })

        await ctx.reply(`
            Hey ${from.first_name}, Welcome to PostGenieBot! I'm here to help you create engaging content for your social media posts. Just keep feeding me your events that happened throughout your day.
            `)
    } 
    
    catch (error) {
console.log(error);

await ctx.reply('Sorry for the incovenience caused , facing some diificulties at this moment')

       
       
    } 
    
})

bot.launch();


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))