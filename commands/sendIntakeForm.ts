// 🟢 This file handles the command to post the intake form prompt in the channel.
import { Client, Message, TextChannel, PermissionsBitField } from 'discord.js';

const intakeMessage = `
> ### Ready to start your journey? 🚀
> 
> To help us understand your goals and provide personalized support, please fill out the server intake form.
> 
> **To create your private, personal form, type \`/getform\` in this channel!** ✍️
`;

export default (client: Client) => {
  client.on('messageCreate', async (message: Message) => {
    // 🟢 Check if the message starts with the command and the author is not a bot.
    if (message.author.bot) return;

    if (message.content.startsWith('!sendintakeform')) {
      // 🟢 Check if the user has administrator permissions to use this command.
      if (message.member && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        // 🟢 Check if INTAKE_CHANNEL_ID is set
        if (!process.env.INTAKE_CHANNEL_ID) {
          await message.reply('INTAKE_CHANNEL_ID environment variable is not set. Please configure it in your .env file.');
          return;
        }
        
        // 🟢 We will get the channel where we want to send the message.
        const intakeChannel = client.channels.cache.get(process.env.INTAKE_CHANNEL_ID) as TextChannel;
        
        // 🟢 Check if the channel exists and is a text channel
        if (!intakeChannel || !(intakeChannel instanceof TextChannel)) {
          await message.reply('Could not find the intake channel. Please check the INTAKE_CHANNEL_ID environment variable.');
          return;
        }

        // 🟢 We send the static message to the channel.
        await intakeChannel.send(intakeMessage);
        try {
          await message.delete();
        } catch (error) {
          console.error('Failed to delete message:', error);
        }
      } else {
        await message.reply('You do not have permission to use this command.');
      }
    }
  });
};
