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
});

sendRules(client);
sendIntakeForm(client);

guildMemberAdd(client);
messageReactionAdd(client);

app.listen(apiPort, () => {
  console.log(`Bot API server listening on port ${apiPort}`);
});

client.login(process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN);
