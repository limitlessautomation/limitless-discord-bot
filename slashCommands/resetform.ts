import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } from 'discord.js';
import { completedUsers, activeFormMessages } from '../handlers/formState';

export const data = new SlashCommandBuilder()
    .setName('resetform')
    .setDescription('Reset a user\'s form so they can fill it out again (Admin only)')
    .addUserOption(option => 
        option.setName('user')
            .setDescription('The user whose form to reset')
            .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: any) {
    try {
        // Check if user has admin permissions
        if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({
                content: 'You do not have permission to use this command.',
                flags: MessageFlags.Ephemeral
            });
        }

        const targetUser = interaction.options.getUser('user');
        const userId = targetUser.id;

        // Remove from completed users set
        if (completedUsers) {
            completedUsers.delete(userId);
        }

        // Remove from active forms if they have one
        if (activeFormMessages) {
            activeFormMessages.delete(userId);
        }

        console.log(`Admin ${interaction.user.tag} reset form for user ${targetUser.tag}`);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Form Reset Successfully')
            .setDescription(`The form for **${targetUser.tag}** has been reset.`)
            .addFields(
                { name: 'User ID', value: userId, inline: true },
                { name: 'Reset by', value: interaction.user.tag, inline: true },
                { name: 'Status', value: 'User can now fill out the form again', inline: false }
            )
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral
        });

    } catch (error) {
        console.error('Error in resetform command:', error);
        await interaction.reply({
            content: 'There was an error resetting the form. Please try again later.',
            flags: MessageFlags.Ephemeral
        });
    }
}
