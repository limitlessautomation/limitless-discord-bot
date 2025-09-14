// 🟢 This file handles the '/getform' command to provide a dynamic intake form.
import {
  Client,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import { questions, categoryOrder } from '../data/questions';
import { FormQuestion, FormOption } from '../data/types';
import { activeFormMessages, completedUsers, initialSelectedOptions, initializeFormTracking } from '../handlers/formState';


// Initialize the tracking
initializeFormTracking();

// The command data defines how the slash command will appear in Discord.
const data = new SlashCommandBuilder()
  .setName('getform')
  .setDescription('Opens an intake form to get to know you better.');

// Helper function to create buttons for multiple choice questions
export function createButtonRows(question: FormQuestion, customIdPrefix: string, selectedOptions?: Set<string>): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  const maxButtonsPerRow = 5;

  for (let i = 0; i < question.options.length; i += maxButtonsPerRow) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const chunk = question.options.slice(i, i + maxButtonsPerRow);

    chunk.forEach((option: FormOption, index: number) => {
      const isSelected = selectedOptions?.has(option.value) || (customIdPrefix === 'initial_goal' && option.value === 'best_version');
      const button = new ButtonBuilder()
        .setCustomId(`${customIdPrefix}_${option.value}`)
        .setLabel(option.label)
        .setStyle(isSelected ? ButtonStyle.Success : ButtonStyle.Secondary);

      if (option.description) {
        // For buttons with descriptions, we could use emoji or other indicators
        button.setEmoji('ℹ️');
      }

      row.addComponents(button);
    });

    rows.push(row);
  }

  return rows;
}

// Helper function to create a modal with a question
function createQuestionModal(question: FormQuestion, customId: string): ModalBuilder {
  const modal = new ModalBuilder().setCustomId(customId).setTitle('Intake Form - Get to Know You');

  // For text input questions, use text input
  const input = new TextInputBuilder()
    .setCustomId(question.id)
    .setLabel(question.label)
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Please provide your answer...')
    .setRequired(true);

  const row = new ActionRowBuilder<TextInputBuilder>().addComponents(input);
  modal.addComponents(row);

  return modal;
}

// The execute function handles the command logic
const execute = async (interaction: ChatInputCommandInteraction) => {
  try {
    const userId = interaction.user.id;

    // Check if user has already completed the form
    if (completedUsers.has(userId)) {
      await interaction.reply({
        content: 'You have already completed the form. If you need to update your goals, please contact an admin.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Check if user already has an active form
    if (activeFormMessages.has(userId)) {
      await interaction.reply({
        content: 'You already have an active form. Please complete it before starting a new one.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Get the initial question
    const initialQuestion = questions['initial'][0];

    // Initialize selected options for this user (pre-select 'best_version' as default)
    const userSelectedOptions = new Set<string>(['best_version']);
    initialSelectedOptions.set(userId, userSelectedOptions);

    // Create buttons for the initial question
    const buttonRows = createButtonRows(initialQuestion, 'initial_goal', userSelectedOptions);

    // Add submit and delete buttons
    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('submit_initial_goals')
        .setLabel('Continue')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('✅'),
      new ButtonBuilder().setCustomId('delete_form').setLabel('Delete Form').setStyle(ButtonStyle.Danger).setEmoji('🗑️')
    );

    // Send a message with the buttons
    const reply = await interaction.reply({
      content: 'Welcome! Please select your main goals for joining the server (you can select multiple):',
      components: [...buttonRows, actionRow],
      flags: MessageFlags.Ephemeral,
    });
    
    // Fetch the reply to get the message ID
    const fetchedReply = await reply.fetch();

    // Store the message ID for potential deletion
    activeFormMessages.set(userId, fetchedReply.id);
  } catch (error) {
    console.error('Failed to show initial question:', error);
    await interaction.reply({
      content: 'Sorry, there was an error showing the form. Please try again later.',
      flags: MessageFlags.Ephemeral,
    });
  }
};

export { data, execute };
