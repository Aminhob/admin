import { botService } from './services/botService';

// Start the bot
console.log('🚀 Starting Telegram Bot...');
try {
  botService.launch();
} catch (error) {
  console.error('Failed to start bot:', error);
  process.exit(1);
}
