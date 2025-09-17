// Mock implementation of Telegraf for development
class MockTelegraf {
  private commands: Record<string, (ctx: any) => void> = {};
  private _isRunning: boolean = false;
  
  constructor(public token: string, public options: any) {}
  
  // Getter for isRunning
  public get isRunning(): boolean {
    return this._isRunning;
  }
  
  // Setter for isRunning
  private set isRunning(value: boolean) {
    this._isRunning = value;
  }
  
  command(name: string, handler: (ctx: any) => void) {
    this.commands[name] = handler;
    return this;
  }
  
  on(_event: string, _handler: (ctx: any) => void) {
    // Mock event listener - parameters are prefixed with _ to indicate they're intentionally unused
    return this;
  }
  
  catch(_handler: (err: any) => void) {
    // Mock error handler - parameter is prefixed with _ to indicate it's intentionally unused
    return this;
  }
  
  async start(): Promise<void> {
    this._isRunning = true;
    console.log('Bot started (mock)');
  }
  
  async stop(_signal?: string): Promise<void> {
    this._isRunning = false;
    console.log('Bot stopped (mock)');
  }
  
  launch() {
    return this.start();
  }
}

// Mock Context type
type Context = {
  reply: (text: string) => void;
  replyWithMarkdown: (text: string) => void;
  message?: {
    text: string;
  };
};

// Mock BOT_CONFIG
const BOT_CONFIG = {
  TOKEN: 'dummy-token',
  OPTIONS: {},
};

// Use mock implementation
const Telegraf = MockTelegraf;

class BotService {
  private bot: InstanceType<typeof Telegraf>;
  private static instance: BotService;

  private constructor() {
    // Use type assertion to handle the mock implementation
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
    this.bot.command('start', (ctx: Context) => {
      ctx.reply('👋 Welcome to the Admin Bot! Use /help to see available commands.');
    });

    // Help command
    this.bot.command('help', (ctx: Context) => {
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
    this.bot.command('status', (ctx: Context) => {
      ctx.reply('✅ Bot is up and running!');
    });
  }

  private setupListeners(): void {
    // Handle text messages
    this.bot.on('text', (ctx: Context) => {
      // Echo the received message if it exists
      if (ctx.message?.text) {
        ctx.reply(`You said: ${ctx.message.text}`);
      }
    });

    // Handle errors
    this.bot.catch((err: any) => {
      console.error('Bot error:', err);
    });
  }

  public async launch(): Promise<void> {
    await this.bot.launch();
    console.log('🤖 Bot is running...');
    
    // Enable graceful stop
    process.once('SIGINT', () => this.stop('SIGINT'));
    process.once('SIGTERM', () => this.stop('SIGTERM'));
  }
  
  // Start the bot
  public async start(): Promise<void> {
    await this.bot.start();
    console.log('Bot started');
  }
  
  // Stop the bot
  public async stop(signal?: string): Promise<void> {
    await this.bot.stop(signal);
    console.log('Bot stopped');
  }
}

export const botService = BotService.getInstance();
