import dotenv from 'dotenv';
import { environment, isDev, isProd } from './config/environment.js';

dotenv.config();

// Log startup environment
console.log(`🚀 Starting ${isDev() ? 'Development' : 'Production'} Bot...`);

import discord from 'discord.js';
const {
  Client,
  GatewayIntentBits,
  Partials,
  Guild,
  GuildMember,
  Role,
  Interaction,
  ChatInputCommandInteraction,
} = discord;
import express from 'express';
import { MongoClient, Db } from 'mongodb';

import slashCommandHandler from './handlers/slashCommandHandler.js';

import sendRules from './commands/sendRules.js';
import sendIntakeForm from './commands/sendIntakeForm.js';

import guildMemberAdd from './events/guildMemberAdd.js';
import messageReactionAdd from './events/messageReactionAdd.js';
import { TikTokLiveService } from './services/TikTokLiveService.js';

const app = express();
const apiPort = process.env.BOT_API_PORT || 4000;

const INTENTS = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildPresences,
];

const PARTIALS = [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User];

const client = new Client({
  intents: INTENTS,
  partials: PARTIALS,
});

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('Missing MONGODB_URI in environment variables.');
}

const mongoClient = new MongoClient(mongoUri);

// Initialize TikTok Live Service
let tiktokLiveService = null;
const tiktokIdentifier = environment.tiktok.userId || environment.tiktok.username;
const channelId = environment.tiktok.liveAnnouncementChannelId;

if (tiktokIdentifier && channelId) {
  try {
    tiktokLiveService = new TikTokLiveService(
      client,
      tiktokIdentifier,
      channelId
    );
    
    const identifierType = environment.tiktok.userId ? 'User ID (recommended)' : 'Username';
    const serverType = isDev() ? 'Test Server' : 'Main Server';
    
    console.log(`✅ TikTok Live Service initialized using ${identifierType}`);
    console.log(`📢 Announcements will be sent to: ${serverType}`);
  } catch (error) {
    console.error('❌ Failed to initialize TikTok Live Service:', error);
  }
} else {
  console.log('ℹ️ TikTok Live Service not initialized - missing environment variables');
  if (!tiktokIdentifier) {
    console.log('   Required (one of): TIKTOK_USER_ID (recommended) or TIKTOK_USERNAME');
  }
  if (!channelId) {
    console.log(`   Required: ${isDev() ? 'TEST_LIVE_ANNOUNCEMENT_CHANNEL_ID' : 'LIVE_ANNOUNCEMENT_CHANNEL_ID'}`);
  }
}

client.once('clientReady', async () => {
  if (client.user) {
    console.log(`Logged in as ${client.user.tag}!`);
  } else {
    console.error('Client user is null. Failed to log in.');
  }
  console.log('Bot is ready to accept API requests.');

  try {
    await mongoClient.connect();
    console.log('Bot successfully connected to MongoDB!');
  } catch (err) {
    console.error('Bot failed to connect to MongoDB:', err);
  }

  // Load slash commands
  await slashCommandHandler(client);

  // Register slash commands with Discord
  try {
    const commands = Array.from(client.commands.values()).map(cmd => cmd.data);
    
    // Register commands globally (can take up to an hour to propagate)
    // For testing, you might want to register to a specific guild first
    const guildId = process.env.GUILD_ID; // Add your guild ID to .env
    
    if (guildId) {
      // Register to specific guild for instant testing
      const guild = await client.guilds.fetch(guildId);
      await guild.commands.set(commands);
      console.log(`Registered ${commands.length} slash commands to guild: ${guild.name}`);
    } else {
      // Register globally (takes longer to propagate)
      await client.application?.commands.set(commands);
      console.log(`Registered ${commands.length} slash commands globally`);
    }
  } catch (error) {
    console.error('Failed to register slash commands:', error);
  }

  // Start TikTok Live monitoring
  if (tiktokLiveService) {
    try {
      await tiktokLiveService.connect();
      console.log('✅ TikTok Live monitoring started');
    } catch (error) {
      console.error('❌ Failed to start TikTok Live monitoring:', error);
    }
  }
});

sendRules(client);
sendIntakeForm(client);

guildMemberAdd(client);
messageReactionAdd(client);

app.listen(apiPort, () => {
  console.log(`Bot API server listening on port ${apiPort}`);
});

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('🔄 Received SIGINT, shutting down gracefully...');
  
  if (tiktokLiveService) {
    tiktokLiveService.disconnect();
    console.log('🔌 TikTok Live Service disconnected');
  }
  
  if (mongoClient) {
    await mongoClient.close();
    console.log('🗄️ MongoDB connection closed');
  }
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Received SIGTERM, shutting down gracefully...');
  
  if (tiktokLiveService) {
    tiktokLiveService.disconnect();
    console.log('🔌 TikTok Live Service disconnected');
  }
  
  if (mongoClient) {
    await mongoClient.close();
    console.log('🗄️ MongoDB connection closed');
  }
  
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN);
