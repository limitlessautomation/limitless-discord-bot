// 🟢 handlers/slashCommandHandler.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import discord from 'discord.js';
const {
  Client,
  Collection,
  Interaction,
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  Message,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  MessageComponentInteraction,
  MessageFlags
} = discord;
import { questions, categoryOrder } from '../data/questions.js';
import { createButtonRows } from '../slashCommands/getform.js';
import { activeFormMessages, completedUsers, initialSelectedOptions } from './formState.js';
import GoogleAppsScriptService from '../services/googleAppsScriptService.js';


// Store user form progress
const userFormProgress = new Map();

// Function to start section-by-section form flow
async function startSectionBySectionFlow(interaction, selectedGoals) {
  const userId = interaction.user.id;
  
  // Initialize user progress
  userFormProgress.set(userId, {
    selectedGoals,
    currentCategoryIndex: 0,
    currentQuestionIndex: 0,
    responses: new Map(),
    selectedOptions: new Set()
  });
  
  // Show first category
  await showCategorySection(interaction, userId);
}

// Function to show a category section with its questions
async function showCategorySection(interaction, userId) {
  const userProgress = userFormProgress.get(userId);
  if (!userProgress) return;
  
  const { selectedGoals, currentCategoryIndex } = userProgress;
  
  // Check if we've completed all categories
  if (currentCategoryIndex >= selectedGoals.length) {
    await showFormCompletion(interaction, userId);
    return;
  }
  
  // Get current category
  const currentGoal = selectedGoals[currentCategoryIndex];
  const categoryMapping = categoryOrder.find(cat => cat.triggerValue === currentGoal);
  
  if (!categoryMapping) {
    // Skip to next category if mapping not found
    userProgress.currentCategoryIndex++;
    userProgress.currentQuestionIndex = 0;
    userProgress.selectedOptions.clear();
    await showCategorySection(interaction, userId);
    return;
  }
  
  const categoryQuestions = questions[categoryMapping.category];
  if (!categoryQuestions || categoryQuestions.length === 0) {
    // Skip to next category if no questions
    userProgress.currentCategoryIndex++;
    userProgress.currentQuestionIndex = 0;
    userProgress.selectedOptions.clear();
    await showCategorySection(interaction, userId);
    return;
  }
  
  // Reset selected options for new category
  userProgress.selectedOptions.clear();
  
  // Show first question in this category
  await showQuestion(interaction, userId, categoryMapping.category, 0);
}

// Function to check if this is the last question in the entire form
async function checkIfLastQuestion(userId, currentCategory, currentQuestionIndex) {
  const userProgress = userFormProgress.get(userId);
  if (!userProgress) return false;
  
  const { selectedGoals, currentCategoryIndex } = userProgress;
  
  // Check if we're at the last category
  if (currentCategoryIndex >= selectedGoals.length - 1) {
    const categoryMapping = categoryOrder.find(cat => cat.triggerValue === selectedGoals[currentCategoryIndex]);
    if (categoryMapping) {
      const categoryQuestions = questions[categoryMapping.category];
      if (categoryQuestions && currentQuestionIndex >= categoryQuestions.length - 1) {
        return true; // This is the last question in the last category
      }
    }
  }
  
  return false;
}

// Function to show a specific question with proper handling for single/multiple selection
async function showQuestion(interaction, userId, category, questionIndex) {
  const userProgress = userFormProgress.get(userId);
  if (!userProgress) return;
  
  const categoryQuestions = questions[category];
  if (!categoryQuestions || questionIndex >= categoryQuestions.length) {
    // No more questions in this category, move to next category
    userProgress.currentCategoryIndex++;
    userProgress.currentQuestionIndex = 0;
    userProgress.selectedOptions.clear();
    await showCategorySection(interaction, userId);
    return;
  }
  
  const currentQuestion = categoryQuestions[questionIndex];
  userProgress.currentQuestionIndex = questionIndex;
  
  // Create buttons for the question
  const buttonRows = createQuestionButtonRows(currentQuestion, category, userProgress.selectedOptions);
  
  // Add navigation buttons based on question type
  const actionRow = new ActionRowBuilder();
  
  if (currentQuestion.questionType === 'multiSelectButton') {
    // Check if this is the last question in the entire form
    const isLastQuestion = await checkIfLastQuestion(userId, category, questionIndex);
    
    // Multiple selection question
    actionRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`submit_multi_select_${category}_${questionIndex}`)
        .setLabel(isLastQuestion ? 'Submit Intake Form' : 'Continue')
        .setStyle(ButtonStyle.Primary)
        .setEmoji(isLastQuestion ? '📋' : '✅')
    );
  }
  // Single selection questions don't need navigation buttons - they auto-advance
  
  const categoryTitle = getCategoryTitle(category);
  
  // Add instruction text for multi-select questions
  let content = `**${categoryTitle}**\n\n${currentQuestion.label}`;
  if (currentQuestion.questionType === 'multiSelectButton') {
    const isLastQuestion = await checkIfLastQuestion(userId, category, questionIndex);
    const buttonText = isLastQuestion ? 'Submit Intake Form' : 'Continue';
    content += `\n\n*Select all that apply, then click "${buttonText}".*`;
  }
  
  const followUpMessage = await interaction.followUp({
    content,
    components: currentQuestion.questionType === 'multiSelectButton' ? [...buttonRows, actionRow] : buttonRows,
    flags: MessageFlags.Ephemeral
  });
  
  // Store the message ID for navigation
  userProgress.currentMessageId = followUpMessage.id;
}

// Function to create button rows for questions
function createQuestionButtonRows(question, category, selectedOptions) {
  const rows = [];
  const maxButtonsPerRow = 5; // Discord allows 5 buttons per row
  const maxTotalRows = 4; // Leave room for the submit/continue button (Discord limit is 5 total)
  
  // Calculate how many rows we would need
  const totalRowsNeeded = Math.ceil(question.options.length / maxButtonsPerRow);
  
  // If we need more rows than allowed, limit the options and add a "More Options" button
  if (totalRowsNeeded > maxTotalRows) {
    const maxOptions = maxTotalRows * maxButtonsPerRow - 1; // Leave room for "More Options" button
    const limitedOptions = question.options.slice(0, maxOptions);
    
    // Create rows with limited options
    for (let i = 0; i < limitedOptions.length; i += maxButtonsPerRow) {
      const row = new ActionRowBuilder();
      const chunk = limitedOptions.slice(i, i + maxButtonsPerRow);
      
      chunk.forEach((option) => {
        const isSelected = selectedOptions?.has(option.value);
        const button = new ButtonBuilder()
          .setCustomId(`question_answer_${category}_${question.id}_${option.value}`)
          .setLabel(option.label)
          .setStyle(isSelected ? ButtonStyle.Success : ButtonStyle.Secondary);
        
        if (option.description) {
          button.setEmoji('ℹ️');
        }
        
        row.addComponents(button);
      });
      
      rows.push(row);
    }
    
    // Add "More Options" button in the last row if there's space
    const lastRow = rows[rows.length - 1];
    if (lastRow && lastRow.components.length < maxButtonsPerRow) {
      lastRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`more_options_${category}_${question.id}`)
          .setLabel('More Options...')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📋')
      );
    } else if (rows.length < maxTotalRows) {
      // Create a new row for "More Options" if needed
      const moreOptionsRow = new ActionRowBuilder();
      moreOptionsRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`more_options_${category}_${question.id}`)
          .setLabel('More Options...')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📋')
      );
      rows.push(moreOptionsRow);
    }
    
    return rows;
  }
  
  // Normal case: create all rows within the limit
  for (let i = 0; i < question.options.length; i += maxButtonsPerRow) {
    const row = new ActionRowBuilder();
    const chunk = question.options.slice(i, i + maxButtonsPerRow);
    
    chunk.forEach((option) => {
      const isSelected = selectedOptions?.has(option.value);
      const button = new ButtonBuilder()
        .setCustomId(`question_answer_${category}_${question.id}_${option.value}`)
        .setLabel(option.label)
        .setStyle(isSelected ? ButtonStyle.Success : ButtonStyle.Secondary);
      
      if (option.description) {
        button.setEmoji('ℹ️');
      }
      
      row.addComponents(button);
    });
    
    rows.push(row);
  }
  
  return rows;
}

// Function to get category title
function getCategoryTitle(category) {
  const titles = {
    'best-version': '🌟 Personal Growth',
    'physical-health': '🏃‍♂️ Physical Health',
    'mental-health': '🧠 Mental Wellbeing',
    'business-owner': '💼 Business',
    'mentoring': '🤝 Mentoring',
    'networking': '🌐 Networking',
    'project-advice': '💡 Project Advice',
    'programming': '💻 Programming',
    'new-skills': '📚 Learning New Skills',
    'job-seeker': '🎯 Job Search'
  };
  
  return titles[category] || category;
}

// Function to show form completion
async function showFormCompletion(interaction, userId) {
  const userProgress = userFormProgress.get(userId);
  if (!userProgress) return;
  
  // Collect all corresponding roles from the user's form responses
  const rolesToAssign = [];
  
  try {
    // 1. Collect roles from initial goals
    for (const goal of userProgress.selectedGoals) {
      const goalOption = questions['initial'][0].options.find(opt => opt.value === goal);
      if (goalOption?.corresponding_role) {
        rolesToAssign.push(goalOption.corresponding_role);
      }
    }
    
    // 2. Collect roles from secondary question responses
    for (const [category, responses] of Object.entries(userProgress.responses)) {
      const categoryQuestions = questions[category];
      if (categoryQuestions && Array.isArray(categoryQuestions)) {
        for (const question of categoryQuestions) {
          const questionResponses = responses[question.id];
          if (questionResponses && Array.isArray(questionResponses)) {
            for (const responseValue of questionResponses) {
              const option = question.options?.find(opt => opt.value === responseValue);
              if (option?.corresponding_role) {
                rolesToAssign.push(option.corresponding_role);
              }
            }
          }
        }
      }
    }
    
    // Remove duplicates while preserving order
    const uniqueRoles = [...new Set(rolesToAssign)];
    
    console.log(`User ${interaction.user.tag} completed form. Roles to assign:`, uniqueRoles);
    
    // Handle role assignment using RoleService
    if (uniqueRoles.length > 0 && interaction.guildId) {
      const { RoleService } = await import('../services/roleService.js');
      const guild = interaction.client.guilds.cache.get(interaction.guildId);
      const member = guild?.members.cache.get(userId);
      
      if (guild && member) {
        const result = await RoleService.handleFormCompletion(member, uniqueRoles);
        
        if (result.success) {
          console.log(`Successfully assigned roles to user ${interaction.user.tag}:`, result.addedRoles);
          if (result.removedRoles.length > 0) {
            console.log(`Removed roles from user ${interaction.user.tag}:`, result.removedRoles);
          }
        } else {
          console.error(`Partial success assigning roles to user ${interaction.user.tag}:`, result.errors);
        }
      } else {
        console.warn(`Could not find guild or member for user ${interaction.user.tag} during role assignment`);
      }
    }
    
  } catch (error) {
    console.error('Error during role assignment in form completion:', error);
  }
  
  // Clean up user progress
  userFormProgress.delete(userId);
  
  // Send completion message
  await interaction.editReply({
    content: `🎉 **Welcome to the Limitless Freedom Blueprint!**\n\nThank you for completing the intake form! Your responses have been recorded and our team will review them shortly.\n\n**What happens next:**\n• Your roles have been assigned based on your goals and interests\n\n**📋 Stay Active & Earn the Elite Role!**\nTo maintain full access to our community and earn the **Elite** role, participate regularly:\n\n**Weekly Requirements (5 total interactions):**\n• **2 new questions or comments** - Share your thoughts, ask questions, or start discussions\n• **3 responses to others** - Help fellow members by answering questions or providing feedback\n\n**Role Progression:**\n• **Verified Role** - Starting role (what you have now)\n• **Elite Role** - Earned by meeting weekly activity requirements\n\n**Important:** If you don't participate for **7 days**, you'll move back to the Verified role. Stay engaged to keep your Elite status!\n\nIf you have any questions, feel free to ask in the help channels or reach out to our moderators. We're excited to have you join our community!`,
    components: [],
  });
}

export default async (client) => {
  // Create a Collection to store the bot's commands.
  client.commands = new Collection(); // 🟢

  const commandsPath = path.join(__dirname, '..', 'slashCommands');
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js')); // 🟢

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(pathToFileURL(filePath).href);

    if ('data' in command && 'execute' in command) {
      // 🟢
      client.commands.set(command.data.name, command);
    } else {
      console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
  console.log(`Loaded ${commandFiles.length} slash commands.`);

  // 🟢 The `interactionCreate` event listener.
  client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: 'There was an error while executing this command!',
            flags: MessageFlags.Ephemeral,
          });
        } else {
          await interaction.reply({
            content: 'There was an error while executing this command!',
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    } else if (interaction.isButton() && interaction.customId.startsWith('initial_goal_')) {
      // Handle individual goal button clicks
      try {
        const goalValue = interaction.customId.replace('initial_goal_', '');
        console.log(`User ${interaction.user.tag} clicked goal:`, goalValue);

        // Check if interaction is already replied or deferred
        if (interaction.replied || interaction.deferred) {
          console.log('Interaction already replied or deferred, skipping');
          return;
        }

        // Acknowledge the interaction immediately to prevent timeout
        try {
          await interaction.deferUpdate();
        } catch (deferError) {
          console.log('Failed to defer update, interaction may have expired:', deferError);
          // Try to respond with a simple acknowledgment
          try {
            await interaction.reply({
              content: 'Selection updated!',
              flags: MessageFlags.Ephemeral,
            });
            return;
          } catch (replyError) {
            console.error('Failed to reply to interaction:', replyError);
            return;
          }
        }
        
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
        
        // Get the initial question and recreate buttons
        const initialQuestion = questions['initial'][0];
        const updatedButtonRows = createButtonRows(initialQuestion, 'initial_goal', userSelectedOptions);
        
        // Recreate the action row with submit and delete buttons
        const updatedActionRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('submit_initial_goals')
            .setLabel('Continue')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('✅'),
          new ButtonBuilder().setCustomId('delete_form').setLabel('Delete Form').setStyle(ButtonStyle.Danger).setEmoji('🗑️')
        );
        
        // Create value to label map from the initial question options
        const valueToLabelMap = {};
        initialQuestion.options.forEach(option => {
          valueToLabelMap[option.value] = option.label;
        });
        
        const selectedArray = Array.from(userSelectedOptions);
        const selectedLabels = selectedArray.map(value => valueToLabelMap[value] || value);
        const selectedValuesText = selectedArray.length > 0 
          ? `Selected: ${selectedLabels.join(', ')}` 
          : 'Welcome! Please select your main goals for joining the server (you can select multiple):';
        
        // Update the message with new selections
        try {
          await interaction.editReply({
            content: selectedValuesText,
            components: [...updatedButtonRows, updatedActionRow]
          });
        } catch (editError) {
          console.error('Failed to edit reply after button click:', editError);
          // Try to send a follow-up message if edit fails
          try {
            await interaction.followUp({
              content: 'There was an error updating your selection. Please try again.',
              flags: MessageFlags.Ephemeral,
            });
          } catch (followUpError) {
            console.error('Failed to send follow-up message:', followUpError);
          }
        }
      } catch (error) {
        console.error('Error processing goal button click:', error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: 'There was an error processing your selection. Please try again later.',
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    } else if (interaction.isButton() && interaction.customId === 'submit_initial_goals') {
      // Handle form submission
      try {
        // Check if interaction is already replied or deferred
        if (interaction.replied || interaction.deferred) {
          console.log('Interaction already replied or deferred, skipping');
          return;
        }

        // Acknowledge the interaction immediately to prevent timeout
        try {
          await interaction.deferUpdate();
        } catch (deferError) {
          console.log('Failed to defer update for submit, interaction may have expired:', deferError);
          // Try to respond with a simple acknowledgment
          try {
            await interaction.reply({
              content: 'Processing your submission...',
              flags: MessageFlags.Ephemeral,
            });
            return;
          } catch (replyError) {
            console.error('Failed to reply to submit interaction:', replyError);
            return;
          }
        }
        
        const userId = interaction.user.id;

        // Get the original message to check for selected buttons
        const message = interaction.message;
        if (!message) {
          console.warn('Could not find the original message');
          await interaction.followUp({
            content: 'There was an error processing your submission. Please try again.',
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        // Get selected goals from the initialSelectedOptions map
        const userSelectedOptions = initialSelectedOptions.get(userId);
        const selectedGoals = userSelectedOptions ? Array.from(userSelectedOptions) : [];

        if (selectedGoals.length === 0) {
          try {
            await interaction.followUp({
              content: 'Please select at least one goal before submitting.',
              flags: MessageFlags.Ephemeral,
            });
          } catch (followUpError) {
            console.error('Failed to send follow-up for empty goals:', followUpError);
          }
          return;
        }

        // Mark user as completed
        if (completedUsers) {
          completedUsers.add(userId);
        }

        // Remove from active forms
        if (activeFormMessages) {
          activeFormMessages.delete(userId);
        }
        
        // Clean up initial selected options
        initialSelectedOptions.delete(userId);

        console.log(`User ${interaction.user.tag} submitted goals:`, selectedGoals);

        // Create value to label map from the initial question options
        const initialQuestion = questions.initial[0];
        const valueToLabelMap = {};
        initialQuestion.options.forEach(option => {
          valueToLabelMap[option.value] = option.label;
        });
        
        const selectedLabels = selectedGoals.map(value => valueToLabelMap[value] || value);
        
        // Update the original message to show selected labels
        try {
          await interaction.editReply({
            content: `Selected: ${selectedLabels.join(', ')}`,
            components: [] // Remove all buttons since we're moving to next question
          });
        } catch (editError) {
          console.error('Failed to update original message with selected values:', editError);
        }

        // Sort selected goals according to categoryOrder
        const sortedSelectedGoals = selectedGoals.sort((a, b) => {
          const indexA = categoryOrder.findIndex(cat => cat.triggerValue === a);
          const indexB = categoryOrder.findIndex(cat => cat.triggerValue === b);
          return indexA - indexB;
        });

        console.log(`User ${interaction.user.tag} sorted goals:`, sortedSelectedGoals);

        // Start section-by-section form flow
        await startSectionBySectionFlow(interaction, sortedSelectedGoals);
      } catch (error) {
        console.error('Error processing form submission:', error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: 'There was an error submitting your form. Please try again later.',
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    } else if (interaction.isButton() && interaction.customId === 'delete_form') {
      // Handle form deletion
      try {
        // Check if interaction is already replied or deferred
        if (interaction.replied || interaction.deferred) {
          console.log('Interaction already replied or deferred, skipping');
          return;
        }

        // Acknowledge the interaction immediately to prevent timeout
        try {
          await interaction.deferUpdate();
        } catch (deferError) {
          console.log('Failed to defer update for delete, interaction may have expired:', deferError);
          // Try to respond with a simple acknowledgment
          try {
            await interaction.reply({
              content: 'Form deleted successfully.',
              flags: MessageFlags.Ephemeral,
            });
            return;
          } catch (replyError) {
            console.error('Failed to reply to delete interaction:', replyError);
            return;
          }
        }
        
        const userId = interaction.user.id;

        // Remove from active forms
        if (activeFormMessages) {
          activeFormMessages.delete(userId);
        }
        
        // Clean up initial selected options
        initialSelectedOptions.delete(userId);

        console.log(`User ${interaction.user.tag} deleted their form`);

        // For ephemeral messages, we can't delete them, but we can update them to show deletion
        try {
          await interaction.editReply({
            content: '✅ Form deleted successfully. You can start a new form anytime with /getform.',
            components: [], // Remove all buttons
          });
        } catch (editError) {
          console.error('Failed to edit reply after delete:', editError);
          try {
            await interaction.followUp({
              content: 'Form deleted successfully.',
              flags: MessageFlags.Ephemeral,
            });
          } catch (followUpError) {
            console.error('Failed to send follow-up after delete:', followUpError);
          }
        }
      } catch (error) {
        console.error('Error processing form deletion:', error);
        // Only reply if the interaction hasn't been replied to yet
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: 'There was an error deleting your form. Please try again later.',
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    } else if (interaction.isModalSubmit() && interaction.customId.startsWith('category_question_')) {
      // Handle category question modal submission
      try {
        const parts = interaction.customId.split('_');
        const category = parts[2];
        const questionIndex = parseInt(parts[3]);

        const categoryQuestions = questions[category];
        if (!categoryQuestions) {
          await interaction.reply({
            content: 'There was an error processing your response. Please try again later.',
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        const currentQuestion = categoryQuestions[questionIndex];
        const response = interaction.fields.getTextInputValue(currentQuestion.id);

        console.log(`User ${interaction.user.tag} answered ${currentQuestion.id}:`, response);

        // Check if there are more questions in this category
        const nextQuestionIndex = questionIndex + 1;
        if (nextQuestionIndex < categoryQuestions.length) {
          const nextQuestion = categoryQuestions[nextQuestionIndex];

          // Create a follow-up message with the next question
          await interaction.reply({
            content: `Great! Now for the next question:\n\n**${nextQuestion.label}**\n\nPlease reply to this message with your answer.`,
            flags: MessageFlags.Ephemeral,
          });

          // TODO: Set up a message collector to handle the user's response
          // For now, we'll just end the flow here
        } else {
          // No more questions in this category
          await interaction.reply({
            content:
              'Thank you for completing the intake form! We have recorded your responses and will use this information to help you better.',
            flags: MessageFlags.Ephemeral,
          });
        }
      } catch (error) {
        console.error('Error processing modal submission:', error);
        await interaction.reply({
          content: 'There was an error processing your response. Please try again later.',
          flags: MessageFlags.Ephemeral,
        });
      }
    } else if (interaction.isModalSubmit() && interaction.customId === 'intake_form') {
      // Handle the old modal submit (for backward compatibility)
      try {
        const name = interaction.fields.getTextInputValue('name');
        const goals = interaction.fields.getTextInputValue('goals');
        const experience = interaction.fields.getTextInputValue('experience');
        const expectations = interaction.fields.getTextInputValue('expectations');

        // Log the form submission
        console.log(`Intake form submitted by ${interaction.user.tag} (${interaction.user.id}):`);
        console.log(`Name: ${name}`);
        console.log(`Goals: ${goals}`);
        console.log(`Experience: ${experience}`);
        console.log(`Expectations: ${expectations}`);

        // Send confirmation message
        await interaction.reply({
          content: `Thank you, ${name}! Your intake form has been submitted successfully. We'll review your information and reach out soon!`,
          flags: MessageFlags.Ephemeral,
        });

        // TODO: Save to database if needed
        // You can add MongoDB storage logic here
      } catch (error) {
        console.error('Error processing modal submission:', error);
        await interaction.reply({
          content: 'There was an error processing your form submission. Please try again later.',
          flags: MessageFlags.Ephemeral,
        });
      }
    } else if (interaction.isButton() && interaction.customId.startsWith('question_answer_')) {
      // Handle question answer button clicks
      await handleQuestionAnswer(interaction);
    } else if (interaction.isButton() && interaction.customId.startsWith('submit_multi_select_')) {
      // Handle multi-select submission
      await handleMultiSelectSubmit(interaction);
    } else if (interaction.isButton() && interaction.customId.startsWith('more_options_')) {
      // Handle "More Options" button click
      await handleMoreOptions(interaction);
    } else if (interaction.isButton() && interaction.customId.startsWith('back_to_main_')) {
      // Handle "Back to Main Options" button click
      await handleBackToMain(interaction);
    }
  });

  // Return the commands for registration
  return client.commands;
};

// Function to handle question answer button clicks
async function handleQuestionAnswer(interaction) {
  try {
    await interaction.deferUpdate();
    
    const userId = interaction.user.id;
    const customId = interaction.customId;
    console.log('DEBUG: customId:', customId);
    
    // Parse custom ID in format: question_answer_${category}_${questionId}_${answerValue}
    const prefix = 'question_answer_';
    if (!customId.startsWith(prefix)) return;
    
    const rest = customId.substring(prefix.length);
    console.log('DEBUG: rest:', rest);
    
    // Extract category first (known categories)
    let category = '';
    let remaining = '';
    
    if (rest.startsWith('physical-health_')) {
      category = 'physical-health';
      remaining = rest.substring('physical-health_'.length);
    } else if (rest.startsWith('mental-health_')) {
      category = 'mental-health';
      remaining = rest.substring('mental-health_'.length);
    } else if (rest.startsWith('best-version_')) {
      category = 'best-version';
      remaining = rest.substring('best-version_'.length);
    } else if (rest.startsWith('project-advice_')) {
      category = 'project-advice';
      remaining = rest.substring('project-advice_'.length);
    } else if (rest.startsWith('networking_')) {
      category = 'networking';
      remaining = rest.substring('networking_'.length);
    } else if (rest.startsWith('mentoring_')) {
      category = 'mentoring';
      remaining = rest.substring('mentoring_'.length);
    } else if (rest.startsWith('business-owner_')) {
      category = 'business-owner';
      remaining = rest.substring('business-owner_'.length);
    } else if (rest.startsWith('programming_')) {
      category = 'programming';
      remaining = rest.substring('programming_'.length);
    } else if (rest.startsWith('job-seeker_')) {
      category = 'job-seeker';
      remaining = rest.substring('job-seeker_'.length);
    } else if (rest.startsWith('new-skills_')) {
      category = 'new-skills';
      remaining = rest.substring('new-skills_'.length);
    } else if (rest.startsWith('product-development_')) {
      category = 'product-development';
      remaining = rest.substring('product-development_'.length);
    }
    
    console.log('DEBUG: category:', category);
    console.log('DEBUG: remaining:', remaining);
    
    // Get the current question to check against known option values
    const userProgress = userFormProgress.get(userId);
    if (!userProgress) return;
    
    // Ensure selectedOptions is initialized
    if (!userProgress.selectedOptions) {
      userProgress.selectedOptions = new Set();
    }
    
    const categoryQuestions = questions[category];
    const currentQuestion = categoryQuestions[userProgress.currentQuestionIndex];
    
    console.log('DEBUG: currentQuestion:', currentQuestion);
    
    // Extract the answer value by finding which option value matches the end of the remaining string
    let answerValue = '';
    let questionId = '';
    for (const option of currentQuestion.options) {
      if (remaining.endsWith('_' + option.value)) {
        answerValue = option.value;
        questionId = remaining.substring(0, remaining.length - option.value.length - 1); // -1 for the underscore
        break;
      }
    }
    
    console.log('DEBUG: questionId:', questionId);
    console.log('DEBUG: answerValue:', answerValue);
    
    if (currentQuestion.questionType === 'multiSelectButton') {
      // Multiple selection question
      if (userProgress.selectedOptions.has(answerValue)) {
        userProgress.selectedOptions.delete(answerValue);
      } else {
        userProgress.selectedOptions.add(answerValue);
      }
      
      // Create updated buttons and action row
      const updatedButtonRows = createQuestionButtonRows(currentQuestion, category, userProgress.selectedOptions);
      const isLastQuestion = await checkIfLastQuestion(userId, category, userProgress.currentQuestionIndex);
      const updatedActionRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`submit_multi_select_${category}_${userProgress.currentQuestionIndex}`)
            .setLabel(isLastQuestion ? 'Submit Intake Form' : 'Continue')
            .setStyle(ButtonStyle.Primary)
            .setEmoji(isLastQuestion ? '📋' : '✅')
        );
      
      // Update the current message with new selections
      await interaction.editReply({
        content: `**${getCategoryTitle(category)}**\n\n${currentQuestion.label}\n\n*Select all that apply, then click "${isLastQuestion ? 'Submit Intake Form' : 'Continue'}".*`,
        components: [...updatedButtonRows, updatedActionRow]
      });
      
    } else {
      // Single selection question - record answer and show next question below
      if (!userProgress.responses.has(questionId)) {
        userProgress.responses.set(questionId, []);
      }
      userProgress.responses.get(questionId)?.push(answerValue);
      
      // Find the selected option's label
      console.log('DEBUG: answerValue:', answerValue);
      console.log('DEBUG: currentQuestion.options:', currentQuestion.options);
      const selectedOption = currentQuestion.options.find(opt => opt.value === answerValue);
      console.log('DEBUG: selectedOption:', selectedOption);
      const selectedLabel = selectedOption ? selectedOption.label : answerValue;
      
      console.log(`User ${interaction.user.tag} answered ${questionId}: ${answerValue}`);
      
      // Update the current message to show the selected answer
      await interaction.editReply({
        content: `✅ ${currentQuestion.label}\n\n**Selected:** ${selectedLabel}`,
        components: [] // Remove buttons from current question
      });
      
      // Show next question below with a small delay
      setTimeout(async () => {
        await showQuestion(interaction, userId, category, userProgress.currentQuestionIndex + 1);
      }, 500);
    }
    
  } catch (error) {
    console.error('Error handling question answer:', error);
  }
}

// Function to handle multi-select submission
async function handleMultiSelectSubmit(interaction) {
  try {
    await interaction.deferUpdate();
    
    const userId = interaction.user.id;
    const parts = interaction.customId.split('_');
    const category = parts[3];
    const questionIndex = parseInt(parts[4]);
    
    const userProgress = userFormProgress.get(userId);
    if (!userProgress) return;
    
    // Ensure selectedOptions is initialized
    if (!userProgress.selectedOptions) {
      userProgress.selectedOptions = new Set();
    }
    
    const categoryQuestions = questions[category];
    const currentQuestion = categoryQuestions[questionIndex];
    
    // Validate minimum and maximum selection requirements
    const selectedCount = userProgress.selectedOptions.size;
    const minValues = currentQuestion.questionType === 'multiSelectButton' ? 1 : 1; // Always require at least 1 selection
    const maxValues = currentQuestion.options.length; // Maximum is all available options
    
    if (selectedCount < minValues) {
      // Create updated buttons and action row to keep the question interactive
      const updatedButtonRows = createQuestionButtonRows(currentQuestion, category, userProgress.selectedOptions);
      const isLastQuestion = await checkIfLastQuestion(userId, category, questionIndex);
      const updatedActionRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`submit_multi_select_${category}_${questionIndex}`)
            .setLabel(isLastQuestion ? 'Submit Intake Form' : 'Continue')
            .setStyle(ButtonStyle.Primary)
            .setEmoji(isLastQuestion ? '📋' : '✅')
        );
      
      await interaction.editReply({
        content: `⚠️ Please select at least ${minValues} option(s). You have selected ${selectedCount}.\n\n**${getCategoryTitle(category)}**\n\n${currentQuestion.label}\n\n*Select all that apply, then click "${isLastQuestion ? 'Submit Intake Form' : 'Continue'}".*`,
        components: [...updatedButtonRows, updatedActionRow]
      });
      return;
    }
    
    if (selectedCount > maxValues) {
      // Create updated buttons and action row to keep the question interactive
      const updatedButtonRows = createQuestionButtonRows(currentQuestion, category, userProgress.selectedOptions);
      const isLastQuestion = await checkIfLastQuestion(userId, category, questionIndex);
      const updatedActionRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`submit_multi_select_${category}_${questionIndex}`)
            .setLabel(isLastQuestion ? 'Submit Intake Form' : 'Continue')
            .setStyle(ButtonStyle.Primary)
            .setEmoji(isLastQuestion ? '📋' : '✅')
        );
      
      await interaction.editReply({
        content: `⚠️ Please select no more than ${maxValues} option(s). You have selected ${selectedCount}.\n\n**${getCategoryTitle(category)}**\n\n${currentQuestion.label}\n\n*Select all that apply, then click "${isLastQuestion ? 'Submit Intake Form' : 'Continue'}".*`,
        components: [...updatedButtonRows, updatedActionRow]
      });
      return;
    }
    
    // Store the selected options
    const questionId = currentQuestion.id;
    if (!userProgress.responses.has(questionId)) {
      userProgress.responses.set(questionId, []);
    }
    userProgress.responses.get(questionId)?.push(...Array.from(userProgress.selectedOptions));
    
    console.log(`User ${interaction.user.tag} answered ${questionId}:`, Array.from(userProgress.selectedOptions));
    
    // Store selected options for display before clearing
    const selectedOptionsForDisplay = Array.from(userProgress.selectedOptions);
    
    // Clear selected options for next question
    userProgress.selectedOptions.clear();
    
    // Update the message to show the answer was recorded
    await interaction.editReply({
      content: `✅ ${currentQuestion.label}\n\n**Selected:** ${selectedOptionsForDisplay.map(value => {
      const option = currentQuestion.options.find(opt => opt.value === value);
      return option ? option.label : value;
    }).join(', ')}`,
      components: []
    });
    
    // Check if this is the last question in the entire form
    const isLastQuestion = await checkIfLastQuestion(userId, category, questionIndex);
    
    if (isLastQuestion) {
      // This is the last question - complete the form submission
      setTimeout(async () => {
        await handleCompleteFormSubmission(interaction, userId, category, questionIndex);
      }, 500);
    } else {
      // Show next question below with a small delay
      setTimeout(async () => {
        await showQuestion(interaction, userId, category, questionIndex + 1);
      }, 500);
    }
    
  } catch (error) {
    console.error('Error handling multi-select submit:', error);
  }
}

// Function to handle "More Options" button click
async function handleMoreOptions(interaction) {
  try {
    const userId = interaction.user.id;
    const userProgress = userFormProgress.get(userId);
    if (!userProgress) return;
    
    // Ensure selectedOptions is initialized
    if (!userProgress.selectedOptions) {
      userProgress.selectedOptions = new Set();
    }
    
    // Parse the custom ID to get category and question ID
    const customIdParts = interaction.customId.split('_');
    const category = customIdParts[2];
    const questionId = customIdParts[3];
    
    // Find the current question
    const categoryQuestions = questions[category];
    const currentQuestion = categoryQuestions.find(q => q.id === questionId);
    if (!currentQuestion) return;
    
    // Find the question index
    const questionIndex = categoryQuestions.findIndex(q => q.id === questionId);
    
    // Get the options that weren't shown in the main message
    const maxTotalRows = 4; // Same as in createQuestionButtonRows
    const maxButtonsPerRow = 5;
    const maxOptions = maxTotalRows * maxButtonsPerRow - 1; // Leave room for "More Options" button
    const remainingOptions = currentQuestion.options.slice(maxOptions);
    
    // Create button rows for the remaining options
    const rows = [];
    for (let i = 0; i < remainingOptions.length; i += maxButtonsPerRow) {
      const row = new ActionRowBuilder();
      const chunk = remainingOptions.slice(i, i + maxButtonsPerRow);
      
      chunk.forEach((option) => {
        const isSelected = userProgress.selectedOptions?.has(option.value);
        const button = new ButtonBuilder()
          .setCustomId(`question_answer_${category}_${questionId}_${option.value}`)
          .setLabel(option.label)
          .setStyle(isSelected ? ButtonStyle.Success : ButtonStyle.Secondary);
        
        if (option.description) {
          button.setEmoji('ℹ️');
        }
        
        row.addComponents(button);
      });
      
      rows.push(row);
    }
    
    // Add a "Back" button
    const backRow = new ActionRowBuilder();
    backRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`back_to_main_${category}_${questionId}`)
        .setLabel('← Back to Main Options')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔙')
    );
    
    await interaction.reply({
      content: `**Additional Options for:** ${currentQuestion.label}\n\n*Select any additional options, then click "← Back to Main Options" to continue.*`,
      components: [...rows, backRow],
      flags: MessageFlags.Ephemeral
    });
    
  } catch (error) {
    console.error('Error handling more options:', error);
    await interaction.reply({
      content: 'There was an error showing additional options. Please try again.',
      flags: MessageFlags.Ephemeral,
    });
  }
}

// Function to handle "Back to Main Options" button click
async function handleBackToMain(interaction) {
  try {
    const userId = interaction.user.id;
    const userProgress = userFormProgress.get(userId);
    if (!userProgress) return;
    
    // Ensure selectedOptions is initialized
    if (!userProgress.selectedOptions) {
      userProgress.selectedOptions = new Set();
    }
    
    // Parse the custom ID to get category and question ID
    const customIdParts = interaction.customId.split('_');
    const category = customIdParts[3];
    const questionId = customIdParts[4];
    
    // Find the current question
    const categoryQuestions = questions[category];
    const currentQuestion = categoryQuestions.find(q => q.id === questionId);
    if (!currentQuestion) return;
    
    // Find the question index
    const questionIndex = categoryQuestions.findIndex(q => q.id === questionId);
    
    // Recreate the main question view with limited options
    const buttonRows = createQuestionButtonRows(currentQuestion, category, userProgress.selectedOptions);
    
    // Add navigation buttons based on question type
    const actionRow = new ActionRowBuilder();
    
    if (currentQuestion.questionType === 'multiSelectButton') {
      // Check if this is the last question in the entire form
      const isLastQuestion = await checkIfLastQuestion(userId, category, questionIndex);
      
      // Multiple selection question
      actionRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`submit_multi_select_${category}_${questionIndex}`)
          .setLabel(isLastQuestion ? 'Submit Intake Form' : 'Continue')
          .setStyle(ButtonStyle.Primary)
          .setEmoji(isLastQuestion ? '📋' : '✅')
      );
    }
    
    const categoryTitle = getCategoryTitle(category);
    
    // Add instruction text for multi-select questions
    let content = `**${categoryTitle}**\n\n${currentQuestion.label}`;
    if (currentQuestion.questionType === 'multiSelectButton') {
      const isLastQuestion = await checkIfLastQuestion(userId, category, questionIndex);
      const buttonText = isLastQuestion ? 'Submit Intake Form' : 'Continue';
      content += `\n\n*Select all that apply, then click "${buttonText}".*`;
    }
    
    // Delete the additional options message and update the original
    await interaction.message.delete();
    
    // Find the original message and update it
    const originalMessage = await interaction.channel?.messages.fetch(userProgress.currentMessageId);
    if (originalMessage) {
      await originalMessage.edit({
        content,
        components: currentQuestion.questionType === 'multiSelectButton' ? [...buttonRows, actionRow] : buttonRows
      });
    }
    
  } catch (error) {
    console.error('Error handling back to main:', error);
    await interaction.reply({
      content: 'There was an error returning to the main options. Please try again.',
      flags: MessageFlags.Ephemeral,
    });
  }
}

// Function to handle complete form submission
async function handleCompleteFormSubmission(interaction, userId, category, questionIndex) {
  try {
    const userProgress = userFormProgress.get(userId);
    if (!userProgress) return;

    console.log(`User ${interaction.user.tag} completed the intake form`);

    // Show loading message and store reference to delete it later
    let loadingMessage;
    try {
      loadingMessage = await interaction.followUp({
        content: '⏳ **Submitting your form...**\n\nPlease wait while we process your responses and assign your roles.',
        components: [],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error('Failed to show submitting message:', error);
    }
    
    // Prepare form data for Google Sheets
    const formData = {
      userId: userId,
      username: interaction.user.tag,
      timestamp: new Date(),
      goals: userProgress.selectedGoals,
      responses: {},
    };

    // Convert Map responses to object format with labels instead of values
    userProgress.responses.forEach((answers, questionId) => {
      // Find which category this question belongs to
      for (const [catName, catQuestions] of Object.entries(questions)) {
        const question = catQuestions.find(q => q.id === questionId);
        if (question) {
          if (!formData.responses[catName]) {
            formData.responses[catName] = {};
          }
          
          // Convert values to labels
          const labelAnswers = answers.map(value => {
            const option = question.options.find(opt => opt.value === value);
            return option ? option.label : value; // Fallback to value if label not found
          });
          
          formData.responses[catName][questionId] = labelAnswers;
          break;
        }
      }
    });

    // Send data to Google Apps Script if configured
    if (process.env.GOOGLE_APPS_SCRIPT_URL) {
      try {
        const googleService = new GoogleAppsScriptService({
          scriptUrl: process.env.GOOGLE_APPS_SCRIPT_URL,
          timeout: parseInt(process.env.GOOGLE_APPS_SCRIPT_TIMEOUT || '10000'),
          retries: parseInt(process.env.GOOGLE_APPS_SCRIPT_RETRIES || '3'),
        });

        await googleService.sendFormResponse(formData);
        console.log('Form data successfully sent to Google Sheets');
      } catch (error) {
        console.error('Error sending form data to Google Sheets:', error);
        // Don't throw here - we still want to complete the form submission
      }
    } else {
      console.log('Google Apps Script URL not configured - skipping Google Sheets submission');
    }

    // Collect all corresponding roles from the user's form responses
    const rolesToAssign = [];
    
    try {
      // 1. Collect roles from initial goals
      for (const goal of userProgress.selectedGoals) {
        const goalOption = questions['initial'][0].options.find(opt => opt.value === goal);
        if (goalOption?.corresponding_role) {
          rolesToAssign.push(goalOption.corresponding_role);
        }
      }
      
      // 2. Collect roles from secondary question responses
      for (const [category, responses] of Object.entries(userProgress.responses)) {
        const categoryQuestions = questions[category];
        if (categoryQuestions && Array.isArray(categoryQuestions)) {
          for (const question of categoryQuestions) {
            const questionResponses = responses[question.id];
            if (questionResponses && Array.isArray(questionResponses)) {
              for (const responseValue of questionResponses) {
                const option = question.options?.find(opt => opt.value === responseValue);
                if (option?.corresponding_role) {
                  rolesToAssign.push(option.corresponding_role);
                }
              }
            }
          }
        }
      }
      
      // Remove duplicates while preserving order
      const uniqueRoles = [...new Set(rolesToAssign)];
      
      console.log(`User ${interaction.user.tag} completed form. Roles to assign:`, uniqueRoles);
      
      // Handle role assignment using RoleService
      if (uniqueRoles.length > 0 && interaction.guildId) {
        const { RoleService } = await import('../services/roleService.js');
        const guild = interaction.client.guilds.cache.get(interaction.guildId);
        if (guild) {
          const member = guild.members.cache.get(interaction.user.id);
          if (member) {
            const roleResult = await RoleService.handleFormCompletion(member, uniqueRoles);
            console.log(`Role assignment result for user ${interaction.user.tag}:`, roleResult);
          }
        }
      }
    } catch (error) {
      console.error('Error during role assignment:', error);
      // Don't throw here - we still want to complete the form submission
    }

    // Delete the loading message before showing success message
    try {
      if (loadingMessage) {
        await loadingMessage.delete();
      }
    } catch (error) {
      // Silently ignore DiscordAPIError[10008] (Unknown Message) as it's expected behavior
      // when the ephemeral message expires or is already deleted
      if (error.code !== 10008) {
        console.warn('Could not delete loading message:', error);
      }
    }

    // Clean up user progress
    userFormProgress.delete(userId);
    completedUsers.add(userId);

    // Send completion message
    await interaction.editReply({
      content: `🎉 **Welcome to the Limitless Freedom Blueprint!**\n\nThank you for completing the intake form! Your responses have been recorded and our team will review them shortly.\n\n**What happens next:**\n• Your roles have been assigned based on your goals and interests\n\n**📋 Stay Active & Earn the Elite Role!**\nTo maintain full access to our community and earn the **Elite** role, participate regularly:\n\n**Weekly Requirements (5 total interactions):**\n• **2 new questions or comments** - Share your thoughts, ask questions, or start discussions\n• **3 responses to others** - Help fellow members by answering questions or providing feedback\n\n**Role Progression:**\n• **Verified Role** - Starting role (what you have now)\n• **Elite Role** - Earned by meeting weekly activity requirements\n\n**Important:** If you don't participate for **7 days**, you'll move back to the Verified role. Stay engaged to keep your Elite status!\n\nIf you have any questions, feel free to ask in the help channels or reach out to our moderators. We're excited to have you join our community!`,
      components: [],
    });

  } catch (error) {
    console.error('Error handling complete form submission:', error);
    await interaction.editReply({
      content: '❌ There was an error processing your form submission. Please try again later or contact a moderator.',
      components: [],
    });
  }
}
