import dotenv from 'dotenv';
import express from 'express';
import connectDb from './src/config/db.js';
import bot from './src/bot.js';

dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000; // Define the port

try {
  connectDb(process.env.MONGO_URI);
} catch (error) {
  console.error(error);
  process.kill(process.pid, "SIGTERM");
}

// Start the bot
bot.launch();

// Define a simple route to check server status
app.get('/', (req, res) => {
  res.send('Telegram Bot is running.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
