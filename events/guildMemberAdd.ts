// 🟢 This file handles the 'guildMemberAdd' event for new members.
import { Client, Guild, GuildMember, Role } from 'discord.js';

export default (client: Client) => {
  client.on('guildMemberAdd', async (member: GuildMember) => {
    try {
      // 🟢 We will get the pending role.
      const pendingRole: Role | undefined = member.guild.roles.cache.find((role) => role.name === 'Pending');

      // 🟢 If the role exists, we will add it to the new member.
      if (pendingRole) {
        await member.roles.add(pendingRole);
        console.log(`Assigned "Pending" role to new member: ${member.user.tag}`);
      } else {
        console.log('Error: "Pending" role not found.');
      }
    } catch (error) {
      console.error('Failed to assign auto-role:', error);
    }
  });
};
