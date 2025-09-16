import { Telegraf } from 'telegraf';
import { BOT_CONFIG } from '../config/bot';

class BotService {
  private bot: Telegraf;
  private static instance: BotService;

  private constructor() {
    this.bot = new Telegraf(BOT_CONFIG.TOKEN, BOT_CONFIG.OPTIONS);
    this.setupCommands();
    this.setupListeners();
  }

  public static getInstance(): BotService {
    if (!BotService.instance) {
      BotService.instance = new BotService();
    }
    return BotService.instance;
  }

  private setupCommands(): void {
    // Start command
    this.bot.command('start', (ctx) => {
      ctx.reply('👋 Welcome to the Admin Bot! Use /help to see available commands.');
    });

    // Help command
    this.bot.command('help', (ctx) => {
      const helpText = `
        🤖 *Available Commands*:
        /start - Start the bot
        /help - Show this help message
        /status - Check bot status
        /users - Get user statistics
      `;
      ctx.replyWithMarkdown(helpText);
    });

    // Status command
    this.bot.command('status', (ctx) => {
      ctx.reply('✅ Bot is up and running!');
    });
  }

  private setupListeners(): void {
    // Handle text messages
    this.bot.on('text', (ctx) => {
      // Echo the received message
      ctx.reply(`You said: ${ctx.message.text}`);
    });

    // Handle errors
    this.bot.catch((err: any) => {
      console.error('Bot error:', err);
    });
  }

  public launch(): void {
    this.bot.launch();
    console.log('🤖 Bot is running...');
    
    // Enable graceful stop
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }
}

export const botService = BotService.getInstance();
