// This file handles the 'messageReactionAdd' event for the reaction role feature.
import discord from 'discord.js';
const {
  Client,
  Guild,
  GuildMember,
  Role,
  MessageReaction,
  PartialMessageReaction,
  User,
  PartialUser,
} = discord;

// Replace these placeholders with your actual IDs and the emoji.
const TARGET_MESSAGE_ID = process.env.TARGET_MESSAGE_ID;
const TARGET_EMOJI = '✅';
const PENDING_ROLE_ID = process.env.PENDING_ROLE_ID;
const INCOMING_ROLE_ID = process.env.INCOMING_ROLE_ID;

export default (client) => {
  // 🟢 The client.on() method attaches the event handler.
  client.on(
    'messageReactionAdd',
    async (reaction, user) => {
      if (user.bot) return;

      if (reaction.partial) {
        try {
          await reaction.fetch();
        } catch (error) {
          console.error('Something went wrong when fetching the message:', error);
          return;
        }
      }

      if (reaction.message.id === TARGET_MESSAGE_ID && reaction.emoji.name === TARGET_EMOJI) {
        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id);
        const pendingRole = guild.roles.cache.get(PENDING_ROLE_ID);
        const incomingRole = guild.roles.cache.get(INCOMING_ROLE_ID);

        if (pendingRole && incomingRole && member.roles.cache.has(PENDING_ROLE_ID)) {
          try {
            await member.roles.remove(pendingRole);
            await member.roles.add(incomingRole);
            console.log(`Removed "Pending" and assigned "Incoming" role to ${member.user.tag} via reaction.`);
          } catch (error) {
            console.error('Failed to add role:', error);
          }
        }
      }
    }
  );
};
