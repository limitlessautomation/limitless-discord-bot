// 🟢 services/FormService.js
import { questions, categoryOrder } from '../data/questions.js';
import { completedUsers } from '../handlers/formState.js';
import GoogleAppsScriptService from './googleAppsScriptService.js';

/**
 * Manages form flow, validation, and completion logic
 */
export class FormService {
  constructor(userProgressManager, questionHandler) {
    this.userProgressManager = userProgressManager;
    this.questionHandler = questionHandler;
  }

  /**
   * Start the section-by-section form flow
   * @param {Interaction} interaction - Discord interaction
   * @param {string[]} selectedGoals - Array of selected goal categories
   */
  async startFormFlow(interaction, selectedGoals) {
    const userId = interaction.user.id;

    // Initialize user progress
    this.userProgressManager.initializeUserProgress(userId, selectedGoals);

    // Show first category
    await this.showCategorySection(interaction, userId);
  }

  /**
   * Show a category section with its questions
   * @param {Interaction} interaction - Discord interaction
   * @param {string} userId - Discord user ID
   */
  async showCategorySection(interaction, userId) {
    const userProgress = this.userProgressManager.getUserProgress(userId);
    if (!userProgress) return;

    const { selectedGoals, currentCategoryIndex } = userProgress;

    // Check if we've completed all categories
    if (this.userProgressManager.isFormComplete(userId)) {
      await this.showFormCompletion(interaction, userId);
      return;
    }

    // Get current category
    const currentGoal = selectedGoals[currentCategoryIndex];
    const categoryMapping = categoryOrder.find((cat) => cat.triggerValue === currentGoal);

    if (!categoryMapping) {
      // Skip to next category if mapping not found
      this.userProgressManager.moveToNextCategory(userId);
      await this.showCategorySection(interaction, userId);
      return;
    }

    const categoryQuestions = questions[categoryMapping.category];
    if (!categoryQuestions || categoryQuestions.length === 0) {
      // Skip to next category if no questions
      this.userProgressManager.moveToNextCategory(userId);
      await this.showCategorySection(interaction, userId);
      return;
    }

    // Reset selected options for new category
    this.userProgressManager.clearSelectedOptions(userId);

    // Show first question in this category
    await this.showQuestion(interaction, userId, categoryMapping.category, 0);
  }

  /**
   * Show a specific question
   * @param {Interaction} interaction - Discord interaction
   * @param {string} userId - Discord user ID
   * @param {string} category - Category name
   * @param {number} questionIndex - Question index
   */
  async showQuestion(interaction, userId, category, questionIndex) {
    console.log('DEBUG: FormService.showQuestion called with:', { category, questionIndex });

    const userProgress = this.userProgressManager.getUserProgress(userId);
    if (!userProgress) {
      console.log('DEBUG: No user progress found for userId:', userId);
      return;
    }

    const categoryQuestions = questions[category];
    console.log(
      'DEBUG: categoryQuestions:',
      categoryQuestions ? `Found ${categoryQuestions.length} questions` : 'Not found'
    );

    if (!categoryQuestions || questionIndex >= categoryQuestions.length) {
      console.log('DEBUG: No more questions in category, moving to next category');
      // No more questions in this category, move to next category
      this.userProgressManager.moveToNextCategory(userId);
      await this.showCategorySection(interaction, userId);
      return;
    }

    // Update current question index
    this.userProgressManager.updateUserProgress(userId, { currentQuestionIndex: questionIndex });

    // Use QuestionHandler to create the question display
    const questionDisplay = this.questionHandler.createQuestionDisplay(userId, category, questionIndex);

    // Add progress indicator
    const progressIndicator = this.questionHandler.getProgressIndicator(userId);
    questionDisplay.content += progressIndicator;

    console.log('DEBUG: About to send followUp message');

    try {
      const followUpMessage = await interaction.followUp({
        content: questionDisplay.content,
        components: questionDisplay.components,
        flags: interaction.replied ? undefined : 64, // MessageFlags.Ephemeral
      });

      console.log('DEBUG: FollowUp message sent, ID:', followUpMessage.id);

      // Store the message ID for navigation
      this.userProgressManager.updateUserProgress(userId, { currentMessageId: followUpMessage.id });
    } catch (error) {
      console.error('Error sending question:', error);

      // Fallback to editReply if followUp fails
      try {
        await interaction.editReply({
          content: questionDisplay.content,
          components: questionDisplay.components,
        });
      } catch (editError) {
        console.error('Error editing reply:', editError);
      }
    }
  }

  /**
   * Handle moving to the next question
   * @param {Interaction} interaction - Discord interaction
   * @param {string} userId - Discord user ID
   * @param {string} category - Current category
   * @param {number} currentQuestionIndex - Current question index
   */
  async moveToNextQuestion(interaction, userId, category, currentQuestionIndex) {
    const userProgress = this.userProgressManager.getUserProgress(userId);
    if (!userProgress) return;

    const categoryQuestions = questions[category];
    const nextQuestionIndex = currentQuestionIndex + 1;

    if (nextQuestionIndex >= categoryQuestions.length) {
      // Move to next category
      this.userProgressManager.moveToNextCategory(userId);
      await this.showCategorySection(interaction, userId);
    } else {
      // Show next question in same category
      await this.showQuestion(interaction, userId, category, nextQuestionIndex);
    }
  }

  /**
   * Validate question response
   * @param {string} userId - Discord user ID
   * @param {string} category - Category name
   * @param {number} questionIndex - Question index
   * @param {Set} selectedOptions - Selected options
   * @returns {Object} Validation result
   */
  validateQuestionResponse(userId, category, questionIndex, selectedOptions) {
    const categoryQuestions = questions[category];
    if (!categoryQuestions || questionIndex >= categoryQuestions.length) {
      return { isValid: false, error: 'Invalid question' };
    }

    const question = categoryQuestions[questionIndex];
    const selectedCount = selectedOptions.size;

    // Check minimum selections
    if (question.minValues && selectedCount < question.minValues) {
      return {
        isValid: false,
        error: `Please select at least ${question.minValues} option(s). You have selected ${selectedCount}.`,
      };
    }

    // Check maximum selections
    if (question.maxValues && selectedCount > question.maxValues) {
      return {
        isValid: false,
        error: `Please select no more than ${question.maxValues} option(s). You have selected ${selectedCount}.`,
      };
    }

    return { isValid: true };
  }

  /**
   * Process form completion and assign roles
   * @param {Interaction} interaction - Discord interaction
   * @param {string} userId - Discord user ID
   */
  async showFormCompletion(interaction, userId) {
    const userProgress = this.userProgressManager.getUserProgress(userId);
    if (!userProgress) return;

    // Collect all corresponding roles from the user's form responses
    const rolesToAssign = [];

    try {
      // 1. Collect roles from initial goals
      for (const goal of userProgress.selectedGoals) {
        const goalOption = questions['initial'][0].options.find((opt) => opt.value === goal);
        if (goalOption?.corresponding_role) {
          rolesToAssign.push(goalOption.corresponding_role);
        }
      }

      // 2. Collect roles from all form responses
      for (const [questionId, responses] of userProgress.responses) {
        // Find the question across all categories
        let questionFound = false;
        for (const [categoryKey, categoryQuestions] of Object.entries(questions)) {
          const question = categoryQuestions.find((q) => q.id === questionId);
          if (question) {
            questionFound = true;
            // For each response, find the corresponding role
            for (const response of responses) {
              const option = question.options.find((opt) => opt.value === response || opt.label === response);
              if (option?.corresponding_role) {
                rolesToAssign.push(option.corresponding_role);
              }
            }
            break;
          }
        }

        if (!questionFound) {
          console.warn(`Question with ID ${questionId} not found in any category`);
        }
      }

      // Remove duplicates while preserving order
      const uniqueRoles = [...new Set(rolesToAssign)];

      console.log(`User ${interaction.user.tag} completed form. Roles to assign:`, uniqueRoles);

      // Handle role assignment using RoleService
      if (uniqueRoles.length > 0 && interaction.guildId) {
        const { RoleService } = await import('./roleService.js');
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
      console.error('Error during role assignment in form completion:', error);
    }

    // Clean up user progress
    this.userProgressManager.cleanupUserProgress(userId);

    // Send completion message
    await interaction.editReply({
      content: `🎉 **Welcome to the Limitless Freedom Blueprint!**\n\nThank you for completing the intake form! Your responses have been recorded and our team will review them shortly.\n\n**What happens next:**\n• Your roles have been assigned based on your goals and interests\n\n**📋 Stay Active & Earn the Elite Role!**\nTo maintain full access to our community and earn the **Elite** role, participate regularly:\n\n**Weekly Requirements (5 total interactions):**\n• **2 new questions or comments** - Share your thoughts, ask questions, or start discussions\n• **3 responses to others** - Help fellow members by answering questions or providing feedback\n\n**Role Progression:**\n• **Verified Role** - Starting role (what you have now)\n• **Elite Role** - Earned by meeting weekly activity requirements\n\n**Important:** If you don't participate for **7 days**, you'll move back to the Verified role. Stay engaged to keep your Elite status!\n\nIf you have any questions, feel free to ask in the help channels or reach out to our moderators. We're excited to have you join our community!`,
      components: [],
    });
  }

  /**
   * Handle complete form submission with Google Sheets integration
   * @param {Interaction} interaction - Discord interaction
   * @param {string} userId - Discord user ID
   * @param {string} category - Current category
   * @param {number} questionIndex - Current question index
   */
  async handleCompleteFormSubmission(interaction, userId, category, questionIndex) {
    try {
      const userProgress = this.userProgressManager.getUserProgress(userId);
      if (!userProgress) return;

      console.log(`User ${interaction.user.tag} completed the intake form`);

      // Show loading message and store reference to delete it later
      let loadingMessage;
      try {
        loadingMessage = await interaction.followUp({
          content:
            '⏳ **Submitting your form...**\n\nPlease wait while we process your responses and assign your roles.',
          components: [],
          flags: 64, // MessageFlags.Ephemeral
        });
      } catch (error) {
        console.error('Error sending loading message:', error);
      }

      // Prepare form data for Google Sheets
      const formData = {
        timestamp: new Date().toISOString(),
        userId: interaction.user.id,
        username: interaction.user.username,
        displayName: interaction.user.displayName || interaction.user.username,
        selectedGoals: userProgress.selectedGoals,
        responses: Object.fromEntries(userProgress.responses),
      };

      // Submit to Google Sheets
      try {
        console.log('Submitting form data to Google Sheets...');
        const result = await GoogleAppsScriptService.submitFormData(formData);
        console.log('Google Sheets submission result:', result);
      } catch (error) {
        console.error('Error submitting to Google Sheets:', error);
        // Continue with form completion even if Google Sheets fails
      }

      // Collect and assign roles
      const rolesToAssign = [];

      try {
        // Collect roles from initial goals
        for (const goal of userProgress.selectedGoals) {
          const goalOption = questions['initial'][0].options.find((opt) => opt.value === goal);
          if (goalOption?.corresponding_role) {
            rolesToAssign.push(goalOption.corresponding_role);
          }
        }

        // Collect roles from form responses
        for (const [questionId, responses] of userProgress.responses) {
          for (const [categoryKey, categoryQuestions] of Object.entries(questions)) {
            const question = categoryQuestions.find((q) => q.id === questionId);
            if (question) {
              for (const response of responses) {
                const option = question.options.find((opt) => opt.value === response || opt.label === response);
                if (option?.corresponding_role) {
                  rolesToAssign.push(option.corresponding_role);
                }
              }
              break;
            }
          }
        }

        // Remove duplicates while preserving order
        const uniqueRoles = [...new Set(rolesToAssign)];

        console.log(`User ${interaction.user.tag} completed form. Roles to assign:`, uniqueRoles);

        // Handle role assignment using RoleService
        if (uniqueRoles.length > 0 && interaction.guildId) {
          const { RoleService } = await import('./roleService.js');
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
          console.log('Successfully deleted loading message');
        }
      } catch (error) {
        // Silently ignore DiscordAPIError[10008] (Unknown Message) as it's expected behavior
        // when the ephemeral message expires or is already deleted
        if (error.code !== 10008) {
          console.warn('Could not delete loading message:', error);
        }
      }

      // Clean up user progress
      this.userProgressManager.cleanupUserProgress(userId);
      completedUsers.add(userId);

      // Send completion message
      await interaction.editReply({
        content: `🎉 **Welcome to the Limitless Freedom Blueprint!**\n\nThank you for completing the intake form! Your responses have been recorded and our team will review them shortly.\n\n**What happens next:**\n• Your roles have been assigned based on your goals and interests\n\n**📋 Stay Active & Earn the Elite Role!**\nTo maintain full access to our community and earn the **Elite** role, participate regularly:\n\n**Weekly Requirements (5 total interactions):**\n• **2 new questions or comments** - Share your thoughts, ask questions, or start discussions\n• **3 responses to others** - Help fellow members by answering questions or providing feedback\n\n**Role Progression:**\n• **Verified Role** - Starting role (what you have now)\n• **Elite Role** - Earned by meeting weekly activity requirements\n\n**Important:** If you don't participate for **7 days**, you'll move back to the Verified role. Stay engaged to keep your Elite status!\n\nIf you have any questions, feel free to ask in the help channels or reach out to our moderators. We're excited to have you join our community!`,
        components: [],
      });
    } catch (error) {
      console.error('Error handling complete form submission:', error);
      await interaction.editReply({
        content:
          '❌ There was an error processing your form submission. Please try again later or contact a moderator.',
        components: [],
      });
    }
  }

  /**
   * Get current category information for a user
   * @param {string} userId - Discord user ID
   * @returns {Object|null} Current category info
   */
  getCurrentCategoryInfo(userId) {
    return this.userProgressManager.getCurrentCategoryInfo(userId);
  }

  /**
   * Check if user has completed the form
   * @param {string} userId - Discord user ID
   * @returns {boolean} True if form is completed
   */
  isFormComplete(userId) {
    return this.userProgressManager.isFormComplete(userId);
  }
}
