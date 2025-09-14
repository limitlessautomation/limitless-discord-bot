// 🟢 This file handles the 'sendrules' command.
import { Client, Message, TextChannel, PermissionsBitField } from 'discord.js';

const rulesMessage = `
> ### Server Rules
> 
> Please read and follow these rules to help keep our community safe, fun, and respectful for everyone.
> --------------------------------
> **1. Respect All Members 🤝**
> Be kind and respectful. No harassment, hate speech, or discrimination.
> --------------------------------
> **2. Keep it Appropriate 🚫**
> No NSFW, excessive swearing, or offensive topics.
> --------------------------------
> **3. No Spam or Unauthorized Promotion 📢**
> Do not flood chats, mass tag, or advertise without staff permission.
> --------------------------------
> **4. Use Channels Correctly 🗂️**
> Post in the correct channels and follow pinned guidelines.
> --------------------------------
> **5. Respect Staff Decisions 🙏**
> Moderators are here to help—follow their instructions respectfully.
> --------------------------------
> **6. Live Your Best Life ✨**
> Be yourself, have fun, and contribute to our positive community vibe!
> --------------------------------
> **7. Consequences 🔨**
> Breaking rules may result in warnings, mutes, kicks, or bans.
> 
> Thank you for being a part of our community!

*ADD A GREEN CHECKMARK TO THIS MESSAGE TO GET ACCESS TO THE NEXT STEP*
`;

export default (client: Client) => {
  client.on('messageCreate', async (message: Message) => {
    // 🟢 Check if the message starts with the command prefix.
    if (message.author.bot) return;

    if (message.content.startsWith('!sendrules')) {
      // 🟢 Check if the user is an administrator or has the correct role.
      if (message.member && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        // 🟢 Get the channel where the message will be sent.
        const rulesChannel = client.channels.cache.get(process.env.RULES_CHANNEL_ID!) as TextChannel;

        // 🟢 Send the rules message to the channel.
        await rulesChannel.send(rulesMessage);
        try {
          await message.delete();
        } catch (error) {
          console.error('Failed to delete message:', error);
        }
      } else {
        // 🟢 We will reply to the user that they do not have permission.
        await message.reply('You do not have permission to use this command.');
      }
    }
  });
};
