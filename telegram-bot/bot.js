import dotenv from 'dotenv';
import { Telegraf, Markup, Scenes, session } from 'telegraf';
import { SocksProxyAgent } from 'socks-proxy-agent';

dotenv.config();

// Load environment variables
const { BOT_TOKEN, MINI_APP_URL, PROXY_URL } = process.env;

// Validate required environment variables
if (!BOT_TOKEN) {
  console.error('❌ Error: BOT_TOKEN is not defined in .env file');
  process.exit(1);
}

// Configure proxy if provided
let telegramConfig = {};
if (PROXY_URL) {
  telegramConfig.telegram = { agent: new SocksProxyAgent(PROXY_URL) };
  console.log('🔌 Using proxy:', PROXY_URL);
}

// Initialize the bot
const bot = new Telegraf(BOT_TOKEN, telegramConfig);

// Store bot information
let botInfo = null;

// Session middleware
bot.use(session());

// Set up main menu
const mainMenu = Markup.keyboard([
  ['📊 Open Admin Panel'],
  ['ℹ️ Help', '🔄 Status']
]).resize();

// Set up commands menu
const setupCommands = async () => {
  try {
    await bot.telegram.setMyCommands([
      { command: 'start', description: 'Start the bot' },
      { command: 'help', description: 'Show help' },
      { command: 'status', description: 'Check bot status' }
    ]);
    console.log('✅ Bot commands set up successfully');
  } catch (error) {
    console.error('❌ Failed to set up bot commands:', error.message);
  }
};

// Set up bot information
const setupBotInfo = async () => {
  try {
    botInfo = await bot.telegram.getMe();
    console.log(`🤖 Bot @${botInfo.username} is starting...`);
  } catch (error) {
    console.error('❌ Failed to get bot info:', error.message);
  }
};

// Start command handler
bot.command('start', async (ctx) => {
  try {
    // Send welcome message with main menu
    await ctx.replyWithMarkdown(
      '👋 *Welcome to Admin Bot!*\n\n' +
      'Use the buttons below to navigate or type /help for more options.',
      {
        ...mainMenu,
        parse_mode: 'Markdown'
      }
    );
    
    // Send Mini App button as a separate message
    await ctx.reply(
      'Click the button below to open the Admin Panel:',
      Markup.inlineKeyboard([
        Markup.button.webApp('🚀 Open Admin Panel', MINI_APP_URL)
      ])
    );
  } catch (error) {
    console.error('Error in start command:', error);
    ctx.reply('❌ An error occurred. Please try again.');
  }
});

// Help command handler with Mini App button
bot.command('help', (ctx) => {
  const keyboard = Markup.inlineKeyboard([
    Markup.button.webApp('Open Admin Panel 🚀', MINI_APP_URL)
  ]);
  
  const helpText = `
🤖 *Available Commands*:
/start - Start the bot
/help - Show this help message
/status - Check bot status

Or click the button below to open the Admin Panel directly.`;
  
  ctx.replyWithMarkdown(helpText, keyboard);
});

// Status command handler
bot.command('status', (ctx) => {
  ctx.reply('✅ Bot is up and running!');
});

// Text message handler
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  
  switch (text) {
    case '📊 Open Admin Panel':
      await ctx.reply(
        'Opening Admin Panel...',
        Markup.inlineKeyboard([
          Markup.button.webApp('Open Admin Panel', MINI_APP_URL)
        ])
      );
      break;
      
    case 'ℹ️ Help':
      await ctx.replyWithMarkdown(
        '🤖 *Help Menu*\n\n' +
        'Use the buttons to navigate:\n' +
        '• *📊 Open Admin Panel* - Access the admin interface\n' +
        '• *ℹ️ Help* - Show this help message\n' +
        '• *🔄 Status* - Check bot status',
        mainMenu
      );
      break;
      
    case '🔄 Status':
      await ctx.reply('✅ Bot is up and running!', mainMenu);
      break;
      
    default:
      // For any other text, show default response with menu
      await ctx.reply(
        'Please use the menu buttons or commands to interact with me.',
        mainMenu
      );
  }
});

// Error handling
bot.catch((err) => {
  console.error('Bot error:', err);
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}`, err);
  ctx.reply('❌ An error occurred. Please try again.');
});

// Start the bot
const startBot = async () => {
  try {
    console.log('🚀 Starting Telegram Bot...');
    
    // Initialize bot
    await setupBotInfo();
    await setupCommands();
    
    // Start polling
    await bot.launch();
    
    console.log(`\n✅ Bot @${botInfo?.username || 'unknown'} is now running!`);
    console.log('📱 Open Telegram and start a chat with your bot');
    
  } catch (error) {
    console.error('❌ Failed to start bot:', error.message);
    process.exit(1);
  }
};

// Start the bot
startBot().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
