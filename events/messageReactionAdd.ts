// This file handles the 'messageReactionAdd' event for the reaction role feature.
import {
  Client,
  Guild,
  GuildMember,
  Role,
  MessageReaction,
  PartialMessageReaction,
  User,
  PartialUser,
} from 'discord.js';

// Replace these placeholders with your actual IDs and the emoji.
const TARGET_MESSAGE_ID = process.env.TARGET_MESSAGE_ID!;
const TARGET_EMOJI = '✅';
const PENDING_ROLE_ID = process.env.PENDING_ROLE_ID!;
const INCOMING_ROLE_ID = process.env.INCOMING_ROLE_ID!;

export default (client: Client) => {
  // 🟢 The client.on() method attaches the event handler.
  client.on(
    'messageReactionAdd',
    async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
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
        const guild: Guild = reaction.message.guild as Guild;
        const member: GuildMember = (await guild.members.fetch(user.id)) as GuildMember;
        const pendingRole: Role = guild.roles.cache.get(PENDING_ROLE_ID) as Role;
        const incomingRole: Role = guild.roles.cache.get(INCOMING_ROLE_ID) as Role;

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
