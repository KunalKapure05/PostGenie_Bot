import User from './models/User.js'
import {message} from 'telegraf/filters'
import Event from './models/Events.js'
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Telegraf } from "telegraf";
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

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

    const {message_id:loadingMessageId} = await ctx.reply(`
        Hey ${from.first_name} , Kindly wait for a moment while i'm curating posts for you
        🚀

        `)

        const {message_id:LoadingStickerId} = await ctx.replyWithSticker(
            'CAACAgIAAxkBAAMgZoJ8FxItPlgSqgzay-_qMM4aid4AAiwAAw220hn6lPv6A5mU_DUE'
        )

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
        await ctx.deleteMessage(loadingStickerId);
        await ctx.deleteMessage(waitingMessageId);
        await ctx.reply("No events found in the last 24 hours");
        return;
    }
    console.log('events',events);


    //make geminiAi api call
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = await genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL,
            systemInstruction: `Act as a senior Copywriter and you write highly engaging posts for linkedin,instagram and twitter using provided thoughts/events throughout the day.
            Write like a human for humans. Craft three engaging social media posts tailored for linkedin , Instagram and twitter audiences. Use simple language.Use given time labels just to understand the order of the event,dont mention the time in the posts.Each posts should be creatively highlight the following events. Ensure the tone is conversational and impactful. Focus on engaging the respective plaftorm's
              audience ,encouraging the interaction, and driving the interest in the events:: ${events.map(event => event.text).join(', ')}`
        });
    
        const chatSession = model.startChat({
            generationConfig: {
                maxOutputTokens: 8192,
            },
        });
    
        const prompt = `Create posts for the following events: ${events.map(event => event.text).join(', ')}`;
        const result = await chatSession.sendMessage(prompt);
        const response = result.response;
        const text = response.text();
    
        // Only update user tokens if usage data is available
        if (chatSession.usage) {
            await User.findOneAndUpdate(
                { tgId: from.id },
                {
                    $inc: {
                        promptTokens: chatSession.usage.prompt_tokens || 0,
                        completionTokens: chatSession.usage.completion_tokens || 0
                    }
                }
            );
        }
            
        console.log('text', text);
        await ctx.deleteMessage(LoadingStickerId);
        await ctx.deleteMessage(loadingMessageId);
    
        await ctx.reply(text);
            
            
            
        } catch (error) {
            console.error(error);
            await ctx.reply(' facing some difficulties at this moment, please try again');
            
        }
        

   
   
    
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
            `Noted👍 , keep texting me your thoughts to generate the posts,just enter the command : /generate`
        )
    } catch (error) {
        console.error(error);
        await ctx.reply(' facing some difficulties at this moment, please try again');

        
    }
   
})

export default bot;