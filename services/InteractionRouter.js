// 🟢 services/InteractionRouter.js
import discord from 'discord.js';
const { MessageFlags } = discord;
import { questions } from '../data/questions.js';

/**
 * Routes different types of interactions to appropriate handlers
 */
export class InteractionRouter {
  constructor(userProgressManager, questionHandler, formService) {
    this.userProgressManager = userProgressManager;
    this.questionHandler = questionHandler;
    this.formService = formService;
  }

  /**
   * Route interaction based on custom ID pattern
   * @param {Interaction} interaction - Discord interaction
   */
  async routeInteraction(interaction) {
    try {
      const customId = interaction.customId;
      console.log('DEBUG: Routing interaction with customId:', customId);

      // Route based on interaction type and custom ID pattern
      if (interaction.isStringSelectMenu()) {
        await this.handleSelectMenuInteraction(interaction);
      } else if (interaction.isButton()) {
        await this.handleButtonInteraction(interaction);
      } else {
        console.warn('Unknown interaction type:', interaction.type);
      }
    } catch (error) {
      console.error('Error routing interaction:', error);
      await this.sendErrorResponse(interaction, 'An error occurred while processing your request.');
    }
  }

  /**
   * Handle string select menu interactions
   * @param {StringSelectMenuInteraction} interaction - Discord select menu interaction
   */
  async handleSelectMenuInteraction(interaction) {
    const customId = interaction.customId;
    const userId = interaction.user.id;

    if (customId.startsWith('form_single_select_')) {
      await this.handleSingleSelectSubmission(interaction);
    } else if (customId.startsWith('form_multi_select_')) {
      await this.handleMultiSelectSubmission(interaction);
    } else {
      console.warn('Unknown select menu customId:', customId);
    }
  }

  /**
   * Handle button interactions
   * @param {ButtonInteraction} interaction - Discord button interaction
   */
  async handleButtonInteraction(interaction) {
    const customId = interaction.customId;
    const userId = interaction.user.id;

    if (customId.startsWith('question_answer_')) {
      await this.handleQuestionAnswerButton(interaction);
    } else if (customId.startsWith('submit_multi_select_')) {
      await this.handleMultiSelectSubmit(interaction);
    } else if (customId.startsWith('next_question_')) {
      await this.handleNextQuestion(interaction);
    } else if (customId.startsWith('complete_form_')) {
      await this.handleCompleteForm(interaction);
    } else if (customId.startsWith('more_options_')) {
      await this.handleMoreOptions(interaction);
    } else if (customId.startsWith('back_to_main_')) {
      await this.handleBackToMain(interaction);
    } else {
      console.warn('Unknown button customId:', customId);
    }
  }

  /**
   * Handle single selection submission
   * @param {StringSelectMenuInteraction} interaction - Discord interaction
   */
  async handleSingleSelectSubmission(interaction) {
    try {
      await interaction.deferUpdate();

      const userId = interaction.user.id;
      const parts = interaction.customId.split('_');
      const category = parts[3];
      const questionIndex = parseInt(parts[4]);
      const selectedValue = interaction.values[0];

      console.log('DEBUG: Single select submission:', { category, questionIndex, selectedValue });

      const userProgress = this.userProgressManager.getUserProgress(userId);
      if (!userProgress) return;

      // Store the response
      const categoryQuestions = questions[category];
      const currentQuestion = categoryQuestions[questionIndex];

      this.userProgressManager.addResponse(userId, currentQuestion.id, [selectedValue]);

      // Move to next question
      await this.formService.moveToNextQuestion(interaction, userId, category, questionIndex);
    } catch (error) {
      console.error('Error handling single select submission:', error);
      await this.sendErrorResponse(interaction, 'Error processing your selection.');
    }
  }

  /**
   * Handle multiple selection submission
   * @param {StringSelectMenuInteraction} interaction - Discord interaction
   */
  async handleMultiSelectSubmission(interaction) {
    try {
      await interaction.deferUpdate();

      const userId = interaction.user.id;
      const parts = interaction.customId.split('_');
      const category = parts[3];
      const questionIndex = parseInt(parts[4]);
      const selectedValues = interaction.values;

      console.log('DEBUG: Multi select submission:', { category, questionIndex, selectedValues });

      const userProgress = this.userProgressManager.getUserProgress(userId);
      if (!userProgress) return;

      // Update selected options
      this.userProgressManager.clearSelectedOptions(userId);
      selectedValues.forEach((value) => {
        this.userProgressManager.addSelectedOption(userId, value);
      });

      // Update the display to show current selections
      const questionDisplay = this.questionHandler.createQuestionDisplay(userId, category, questionIndex);
      const progressIndicator = this.questionHandler.getProgressIndicator(userId);
      questionDisplay.content += progressIndicator;

      await interaction.editReply({
        content: questionDisplay.content,
        components: questionDisplay.components,
      });
    } catch (error) {
      console.error('Error handling multi select submission:', error);
      await this.sendErrorResponse(interaction, 'Error processing your selections.');
    }
  }

  /**
   * Handle question answer button clicks
   * @param {ButtonInteraction} interaction - Discord interaction
   */
  async handleQuestionAnswerButton(interaction) {
    try {
      await interaction.deferUpdate();

      const userId = interaction.user.id;
      const customIdParts = interaction.customId.split('_');
      const category = customIdParts[2];
      const questionId = customIdParts[3];
      const answerValue = customIdParts[4];

      console.log('DEBUG: Question answer button:', { category, questionId, answerValue });

      const userProgress = this.userProgressManager.getUserProgress(userId);
      if (!userProgress) return;

      // Find the current question
      const categoryQuestions = questions[category];
      const currentQuestion = categoryQuestions.find((q) => q.id === questionId);

      if (!currentQuestion) {
        console.error('Question not found:', questionId);
        return;
      }

      // Handle based on question type
      if (currentQuestion.questionType === 'multiSelectButton') {
        // Toggle selection for multi-select
        if (userProgress.selectedOptions.has(answerValue)) {
          this.userProgressManager.removeSelectedOption(userId, answerValue);
        } else {
          this.userProgressManager.addSelectedOption(userId, answerValue);
        }

        // Update the display
        const questionDisplay = this.questionHandler.createQuestionDisplay(
          userId,
          category,
          userProgress.currentQuestionIndex
        );
        const progressIndicator = this.questionHandler.getProgressIndicator(userId);
        questionDisplay.content += progressIndicator;

        await interaction.editReply({
          content: questionDisplay.content,
          components: questionDisplay.components,
        });
      } else {
        // Single selection - record answer and move to next question
        this.userProgressManager.addResponse(userId, questionId, [answerValue]);

        const questionIndex = categoryQuestions.findIndex((q) => q.id === questionId);
        await this.formService.moveToNextQuestion(interaction, userId, category, questionIndex);
      }
    } catch (error) {
      console.error('Error handling question answer button:', error);
      await this.sendErrorResponse(interaction, 'Error processing your answer.');
    }
  }

  /**
   * Handle multi-select submit button
   * @param {ButtonInteraction} interaction - Discord interaction
   */
  async handleMultiSelectSubmit(interaction) {
    try {
      await interaction.deferUpdate();

      const userId = interaction.user.id;
      const parts = interaction.customId.split('_');
      const category = parts[3];
      const questionIndex = parseInt(parts[4]);

      console.log('DEBUG: Multi select submit:', { category, questionIndex });

      const userProgress = this.userProgressManager.getUserProgress(userId);
      if (!userProgress) return;

      const categoryQuestions = questions[category];
      const currentQuestion = categoryQuestions[questionIndex];

      // Validate selections
      const validation = this.formService.validateQuestionResponse(
        userId,
        category,
        questionIndex,
        userProgress.selectedOptions
      );

      if (!validation.isValid) {
        await this.sendErrorResponse(interaction, validation.error);
        return;
      }

      // Store the responses
      const selectedArray = Array.from(userProgress.selectedOptions);
      this.userProgressManager.addResponse(userId, currentQuestion.id, selectedArray);

      // Check if this is the last question
      const isLastQuestion = this.questionHandler.isLastQuestion(userId, category, questionIndex);

      if (isLastQuestion) {
        // Complete the form
        setTimeout(async () => {
          await this.formService.handleCompleteFormSubmission(interaction, userId, category, questionIndex);
        }, 500);
      } else {
        // Move to next question
        await this.formService.moveToNextQuestion(interaction, userId, category, questionIndex);
      }
    } catch (error) {
      console.error('Error handling multi select submit:', error);
      await this.sendErrorResponse(interaction, 'Error submitting your selections.');
    }
  }

  /**
   * Handle next question button
   * @param {ButtonInteraction} interaction - Discord interaction
   */
  async handleNextQuestion(interaction) {
    try {
      await interaction.deferUpdate();

      const userId = interaction.user.id;
      const parts = interaction.customId.split('_');
      const category = parts[2];
      const questionIndex = parseInt(parts[3]);

      await this.formService.moveToNextQuestion(interaction, userId, category, questionIndex);
    } catch (error) {
      console.error('Error handling next question:', error);
      await this.sendErrorResponse(interaction, 'Error moving to next question.');
    }
  }

  /**
   * Handle complete form button
   * @param {ButtonInteraction} interaction - Discord interaction
   */
  async handleCompleteForm(interaction) {
    try {
      await interaction.deferUpdate();

      const userId = interaction.user.id;
      const parts = interaction.customId.split('_');
      const category = parts[2];
      const questionIndex = parseInt(parts[3]);

      await this.formService.handleCompleteFormSubmission(interaction, userId, category, questionIndex);
    } catch (error) {
      console.error('Error handling complete form:', error);
      await this.sendErrorResponse(interaction, 'Error completing the form.');
    }
  }

  /**
   * Handle more options button
   * @param {ButtonInteraction} interaction - Discord interaction
   */
  async handleMoreOptions(interaction) {
    try {
      const userId = interaction.user.id;
      const parts = interaction.customId.split('_');
      const category = parts[2];
      const questionIndex = parseInt(parts[3]);

      // Show additional options (implement pagination logic)
      const questionDisplay = this.questionHandler.createQuestionDisplay(userId, category, questionIndex, 25);
      const progressIndicator = this.questionHandler.getProgressIndicator(userId);
      questionDisplay.content += progressIndicator;

      await interaction.reply({
        content: questionDisplay.content,
        components: questionDisplay.components,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error('Error handling more options:', error);
      await this.sendErrorResponse(interaction, 'Error showing additional options.');
    }
  }

  /**
   * Handle back to main options button
   * @param {ButtonInteraction} interaction - Discord interaction
   */
  async handleBackToMain(interaction) {
    try {
      const userId = interaction.user.id;
      const parts = interaction.customId.split('_');
      const category = parts[3];
      const questionIndex = parseInt(parts[4]);

      // Show main options (first 25)
      const questionDisplay = this.questionHandler.createQuestionDisplay(userId, category, questionIndex, 0);
      const progressIndicator = this.questionHandler.getProgressIndicator(userId);
      questionDisplay.content += progressIndicator;

      await interaction.update({
        content: questionDisplay.content,
        components: questionDisplay.components,
      });
    } catch (error) {
      console.error('Error handling back to main:', error);
      await this.sendErrorResponse(interaction, 'Error returning to main options.');
    }
  }

  /**
   * Send error response to user
   * @param {Interaction} interaction - Discord interaction
   * @param {string} message - Error message
   */
  async sendErrorResponse(interaction, message) {
    try {
      const errorContent = `❌ ${message}`;

      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({
          content: errorContent,
          components: [],
        });
      } else {
        await interaction.reply({
          content: errorContent,
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (error) {
      console.error('Error sending error response:', error);
    }
  }
}
