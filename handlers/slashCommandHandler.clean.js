// 🟢 handlers/slashCommandHandler.js - CLEAN VERSION
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import discord from 'discord.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
  Collection,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = discord;

import { createButtonRows } from '../slashCommands/getform.js';
import { activeFormMessages, completedUsers, initialSelectedOptions } from './formState.js';
import { userProgressManager } from '../services/UserProgressManager.js';
import { QuestionHandler } from '../services/QuestionHandler.js';
import { FormService } from '../services/FormService.js';
import { InteractionRouter } from '../services/InteractionRouter.js';
import { questions } from '../data/questions.js';

// Initialize services
const questionHandler = new QuestionHandler(userProgressManager);
const formService = new FormService(userProgressManager, questionHandler);
const interactionRouter = new InteractionRouter(userProgressManager, questionHandler, formService);

/**
 * Main export function - sets up slash commands and interaction handling
 */
export default async (client) => {
  // Create a Collection to store the bot's commands
  client.commands = new Collection();

  // Load slash commands
  const commandsPath = path.join(__dirname, '..', 'slashCommands');
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(pathToFileURL(filePath).href);

    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
  console.log(`Loaded ${commandFiles.length} slash commands.`);

  // Set up interaction handling
  client.on('interactionCreate', async (interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        await handleSlashCommand(interaction, client);
      } else if (interaction.isButton()) {
        await handleButtonInteraction(interaction);
      } else if (interaction.isStringSelectMenu()) {
        await handleSelectMenuInteraction(interaction);
      }
    } catch (error) {
      console.error('Error handling interaction:', error);
      await sendErrorResponse(interaction, 'An unexpected error occurred.');
    }
  });

  return client.commands;
};

/**
 * Handle slash command interactions
 */
async function handleSlashCommand(interaction, client) {
  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('Error executing slash command:', error);
    const errorMessage = 'There was an error while executing this command!';
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: errorMessage,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: errorMessage,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}

/**
 * Handle button interactions
 */
async function handleButtonInteraction(interaction) {
  const customId = interaction.customId;

  // Handle initial goal selection buttons
  if (customId.startsWith('initial_goal_')) {
    await handleInitialGoalButton(interaction);
  }
  // Handle initial goals submission
  else if (customId === 'submit_initial_goals') {
    await handleInitialGoalsSubmission(interaction);
  }
  // Handle form deletion
  else if (customId === 'delete_form') {
    await handleFormDeletion(interaction);
  }
  // Route form-related interactions to InteractionRouter
  else if (isFormRelatedInteraction(customId)) {
    await interactionRouter.routeInteraction(interaction);
  }
  else {
    console.warn('Unknown button customId:', customId);
  }
}

/**
 * Handle select menu interactions
 */
async function handleSelectMenuInteraction(interaction) {
  const customId = interaction.customId;

  // Route form-related interactions to InteractionRouter
  if (isFormRelatedInteraction(customId)) {
    await interactionRouter.routeInteraction(interaction);
  } else {
    console.warn('Unknown select menu customId:', customId);
  }
}

/**
 * Check if interaction is form-related
 */
function isFormRelatedInteraction(customId) {
  const formPrefixes = [
    'question_answer_',
    'submit_multi_select_',
    'more_options_',
    'back_to_main_',
    'form_single_select_',
    'form_multi_select_',
    'next_question_',
    'complete_form_'
  ];
  
  return formPrefixes.some(prefix => customId.startsWith(prefix));
}

/**
 * Handle initial goal button clicks
 */
async function handleInitialGoalButton(interaction) {
  try {
    const goalValue = interaction.customId.replace('initial_goal_', '');
    console.log(`User ${interaction.user.tag} clicked goal:`, goalValue);

    if (interaction.replied || interaction.deferred) {
      console.log('Interaction already replied or deferred, skipping');
      return;
    }

    await interaction.deferUpdate();
    const userId = interaction.user.id;
    
    // Get or initialize user's selected options
    let userSelectedOptions = initialSelectedOptions.get(userId);
    if (!userSelectedOptions) {
      userSelectedOptions = new Set(['best_version']); // Default selection
      initialSelectedOptions.set(userId, userSelectedOptions);
    }
    
    // Toggle the selection
    if (userSelectedOptions.has(goalValue)) {
      userSelectedOptions.delete(goalValue);
    } else {
      userSelectedOptions.add(goalValue);
    }
    
    // Update the display
    await updateInitialGoalsDisplay(interaction, userSelectedOptions);
    
  } catch (error) {
    console.error('Error processing goal button click:', error);
    await sendErrorResponse(interaction, 'There was an error processing your selection.');
  }
}

/**
 * Handle initial goals submission
 */
async function handleInitialGoalsSubmission(interaction) {
  try {
    if (interaction.replied || interaction.deferred) {
      console.log('Interaction already replied or deferred, skipping');
      return;
    }

    await interaction.deferUpdate();
    const userId = interaction.user.id;
    const userSelectedOptions = initialSelectedOptions.get(userId);
    
    if (!userSelectedOptions || userSelectedOptions.size === 0) {
      await sendErrorResponse(interaction, 'Please select at least one goal before continuing.');
      return;
    }

    const selectedArray = Array.from(userSelectedOptions);
    console.log(`User ${interaction.user.tag} submitted goals:`, selectedArray);

    // Start the form flow using FormService
    await formService.startFormFlow(interaction, selectedArray);
    
    // Clean up initial selections
    initialSelectedOptions.delete(userId);
    
  } catch (error) {
    console.error('Error processing goal submission:', error);
    await sendErrorResponse(interaction, 'There was an error processing your submission.');
  }
}

/**
 * Handle form deletion
 */
async function handleFormDeletion(interaction) {
  try {
    const userId = interaction.user.id;
    
    // Clean up user data
    initialSelectedOptions.delete(userId);
    userProgressManager.cleanupUserProgress(userId);
    completedUsers.delete(userId);
    
    await interaction.update({
      content: '🗑️ **Form Deleted**\n\nYour form has been deleted. You can start over anytime with `/getform`.',
      components: []
    });
    
  } catch (error) {
    console.error('Error deleting form:', error);
    await sendErrorResponse(interaction, 'There was an error deleting your form.');
  }
}

/**
 * Update initial goals display
 */
async function updateInitialGoalsDisplay(interaction, userSelectedOptions) {
  const initialQuestion = questions['initial'][0];
  const updatedButtonRows = createButtonRows(initialQuestion, 'initial_goal', userSelectedOptions);
  
  const updatedActionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('submit_initial_goals')
      .setLabel('Continue')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('✅'),
    new ButtonBuilder()
      .setCustomId('delete_form')
      .setLabel('Delete Form')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🗑️')
  );
  
  // Create value to label map
  const valueToLabelMap = {};
  initialQuestion.options.forEach(option => {
    valueToLabelMap[option.value] = option.label;
  });
  
  const selectedArray = Array.from(userSelectedOptions);
  const selectedLabels = selectedArray.map(value => valueToLabelMap[value] || value);
  const selectedValuesText = selectedArray.length > 0 
    ? `Selected: ${selectedLabels.join(', ')}` 
    : 'Welcome! Please select your main goals for joining the server (you can select multiple):';
  
  await interaction.editReply({
    content: selectedValuesText,
    components: [...updatedButtonRows, updatedActionRow]
  });
}

/**
 * Send error response to user
 */
async function sendErrorResponse(interaction, message) {
  try {
    const errorContent = `❌ ${message}`;
    
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({
        content: errorContent,
        components: []
      });
    } else {
      await interaction.reply({
        content: errorContent,
        flags: MessageFlags.Ephemeral
      });
    }
  } catch (error) {
    console.error('Error sending error response:', error);
  }
}

// Export functions for use by slash commands
export { 
  formService as startSectionBySectionFlow  // For backward compatibility
};
