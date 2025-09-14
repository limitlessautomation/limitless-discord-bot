// 🟢 This file handles the '/clearforms' command to delete existing form messages
import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } from 'discord.js';

// The command data defines how the slash command will appear in Discord.
const data = new SlashCommandBuilder()
  .setName('clearforms')
  .setDescription('Delete all form messages in the current channel (Admin only)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

// The execute function handles the command logic
const execute = async (interaction: ChatInputCommandInteraction) => {
  try {
    // Check if user has admin permissions
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({
        content: 'You do not have permission to use this command. Administrator permissions required.',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const channel = interaction.channel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: 'This command can only be used in text channels.',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // Fetch messages in the channel (last 100 messages)
    const messages = await channel.messages.fetch({ limit: 100 });
    
    // Find messages that contain form-related content
    const formMessages = messages.filter(msg => 
      msg.content.includes('Welcome! Please select your main goals') ||
      msg.content.includes('Please select your main goals') ||
      msg.author.bot && msg.components.length > 0
    );

    if (formMessages.size === 0) {
      await interaction.editReply({
        content: 'No form messages found in this channel.'
      });
      return;
    }

    // Delete the form messages
    let deletedCount = 0;
    for (const message of formMessages.values()) {
      try {
        await message.delete();
        deletedCount++;
      } catch (error) {
        console.warn(`Could not delete message ${message.id}:`, error);
      }
    }

    await interaction.editReply({
      content: `✅ Successfully deleted ${deletedCount} form message(s) from this channel.`
    });

  } catch (error) {
    console.error('Error clearing form messages:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'There was an error clearing form messages. Please try again later.',
        flags: MessageFlags.Ephemeral
      });
    } else {
      await interaction.editReply({
        content: 'There was an error clearing form messages. Please try again later.'
      });
    }
  }
};

export { data, execute };
