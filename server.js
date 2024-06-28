import { config } from 'dotenv';

config();
import { Telegraf } from "telegraf";
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start(async(ctx)=>{
    console.log('ctx',ctx);
    await ctx.reply("Welcome to PostGenie bot, How can i assist you?");
})

bot.launch();


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))