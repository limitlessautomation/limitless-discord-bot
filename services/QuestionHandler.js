// 🟢 services/QuestionHandler.js
import discord from 'discord.js';
const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } =
  discord;
import { questions, categoryOrder } from '../data/questions.js';
import { createButtonRows } from '../slashCommands/getform.js';

/**
 * Handles question display logic and UI component creation
 */
export class QuestionHandler {
  constructor(userProgressManager) {
    this.userProgressManager = userProgressManager;
  }

  /**
   * Get category title for display
   * @param {string} category - Category key
   * @returns {string} Formatted category title
   */
  getCategoryTitle(category) {
    const titles = {
      initial: '🎯 Initial Goals',
      'business-ownership': '🏢 Business Ownership',
      'job-seeker': '💼 Job Seeker',
      networking: '🤝 Networking',
      mentoring: '👥 Mentoring',
      'mental-health': '🧠 Mental Health',
      'physical-health': '💪 Physical Health',
      programming: '💻 Programming',
      'new-skills': '📚 Learning New Skills',
      'product-development': '🚀 Product Development',
    };

    return titles[category] || category;
  }

  /**
   * Check if this is the last question in the entire form
   * @param {string} userId - Discord user ID
   * @param {string} currentCategory - Current category
   * @param {number} currentQuestionIndex - Current question index
   * @returns {boolean} True if this is the last question
   */
  isLastQuestion(userId, currentCategory, currentQuestionIndex) {
    const userProgress = this.userProgressManager.getUserProgress(userId);
    if (!userProgress) return false;

    const { selectedGoals, currentCategoryIndex } = userProgress;

    // Check if we're at the last category
    if (currentCategoryIndex >= selectedGoals.length - 1) {
      const categoryMapping = categoryOrder.find((cat) => cat.triggerValue === selectedGoals[currentCategoryIndex]);
      if (categoryMapping) {
        const categoryQuestions = questions[categoryMapping.category];
        if (categoryQuestions && currentQuestionIndex >= categoryQuestions.length - 1) {
          return true; // This is the last question in the last category
        }
      }
    }

    return false;
  }

  /**
   * Create select menu for single selection questions
   * @param {Object} question - Question object
   * @param {string} category - Category name
   * @param {number} questionIndex - Question index
   * @param {Set} selectedOptions - Currently selected options
   * @returns {StringSelectMenuBuilder} Select menu component
   */
  createSingleSelectMenu(question, category, questionIndex, selectedOptions) {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`form_single_select_${category}_${questionIndex}`)
      .setPlaceholder('Choose an option...')
      .setMinValues(1)
      .setMaxValues(1);

    // Add options to the select menu
    question.options.forEach((option, index) => {
      selectMenu.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(option.label)
          .setValue(option.value)
          .setDescription(option.description || '')
          .setDefault(selectedOptions.has(option.value))
      );
    });

    return selectMenu;
  }

  /**
   * Create select menu for multiple selection questions
   * @param {Object} question - Question object
   * @param {string} category - Category name
   * @param {number} questionIndex - Question index
   * @param {Set} selectedOptions - Currently selected options
   * @param {number} startIndex - Starting index for options (for pagination)
   * @param {number} maxOptions - Maximum options to show
   * @returns {StringSelectMenuBuilder} Select menu component
   */
  createMultiSelectMenu(question, category, questionIndex, selectedOptions, startIndex = 0, maxOptions = 25) {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`form_multi_select_${category}_${questionIndex}`)
      .setPlaceholder('Choose one or more options...')
      .setMinValues(0)
      .setMaxValues(Math.min(question.options.length - startIndex, maxOptions));

    // Add options to the select menu (with pagination support)
    const optionsToShow = question.options.slice(startIndex, startIndex + maxOptions);
    optionsToShow.forEach((option) => {
      selectMenu.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(option.label)
          .setValue(option.value)
          .setDescription(option.description || '')
          .setDefault(selectedOptions.has(option.value))
      );
    });

    return selectMenu;
  }

  /**
   * Create navigation buttons for questions
   * @param {string} category - Category name
   * @param {number} questionIndex - Question index
   * @param {boolean} isLastQuestion - Whether this is the last question
   * @param {boolean} hasMoreOptions - Whether there are more options to show
   * @param {boolean} showBackToMain - Whether to show back to main button
   * @returns {ActionRowBuilder[]} Array of action rows with buttons
   */
  createNavigationButtons(category, questionIndex, isLastQuestion, hasMoreOptions = false, showBackToMain = false) {
    const buttons = [];

    if (hasMoreOptions) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`more_options_${category}_${questionIndex}`)
          .setLabel('More Options')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📋')
      );
    }

    if (showBackToMain) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`back_to_main_${category}_${questionIndex}`)
          .setLabel('Back to Main Options')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('⬅️')
      );
    }

    if (isLastQuestion) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`complete_form_${category}_${questionIndex}`)
          .setLabel('Complete Form')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅')
      );
    } else {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`next_question_${category}_${questionIndex}`)
          .setLabel('Next Question')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('➡️')
      );
    }

    // Create action rows (max 5 buttons per row)
    const actionRows = [];
    for (let i = 0; i < buttons.length; i += 5) {
      const row = new ActionRowBuilder().addComponents(buttons.slice(i, i + 5));
      actionRows.push(row);
    }

    return actionRows;
  }

  /**
   * Create complete question display with components
   * @param {string} userId - Discord user ID
   * @param {string} category - Category name
   * @param {number} questionIndex - Question index
   * @param {number} startIndex - Starting index for options (for pagination)
   * @returns {Object} Question display object with content and components
   */
  createQuestionDisplay(userId, category, questionIndex, startIndex = 0) {
    const userProgress = this.userProgressManager.getUserProgress(userId);
    if (!userProgress) {
      return {
        content: '❌ Session expired. Please start over with `/getform`.',
        components: [],
      };
    }

    const categoryQuestions = questions[category];
    if (!categoryQuestions || questionIndex >= categoryQuestions.length) {
      console.log('DEBUG: Invalid category or question index:', {
        category,
        questionIndex,
        available: categoryQuestions?.length,
      });
      return {
        content: '❌ Invalid question. Please try again.',
        components: [],
      };
    }

    const question = categoryQuestions[questionIndex];
    const categoryTitle = this.getCategoryTitle(category);
    const isLastQuestion = this.isLastQuestion(userId, category, questionIndex);
    const selectedOptions = userProgress.selectedOptions || new Set();

    // Build the question content
    let content = `## ${categoryTitle}\n\n**Question ${questionIndex + 1}:** ${question.question}\n\n`;

    if (question.description) {
      content += `*${question.description}*\n\n`;
    }

    // Show selected options if any
    if (selectedOptions.size > 0) {
      content += `**Currently selected:** ${Array.from(selectedOptions).join(', ')}\n\n`;
    }

    content += `Please make your selection${question.multiple ? 's' : ''} below:`;

    // Create components based on question type
    const components = [];
    const maxOptionsPerMenu = 25;
    const hasMoreOptions = question.options.length > startIndex + maxOptionsPerMenu;
    const showBackToMain = startIndex > 0;

    if (question.multiple) {
      // Multiple selection
      const selectMenu = this.createMultiSelectMenu(
        question,
        category,
        questionIndex,
        selectedOptions,
        startIndex,
        maxOptionsPerMenu
      );
      components.push(new ActionRowBuilder().addComponents(selectMenu));
    } else {
      // Single selection
      if (question.options.length <= maxOptionsPerMenu) {
        const selectMenu = this.createSingleSelectMenu(question, category, questionIndex, selectedOptions);
        components.push(new ActionRowBuilder().addComponents(selectMenu));
      } else {
        // Handle pagination for single select if needed
        const selectMenu = this.createMultiSelectMenu(
          question,
          category,
          questionIndex,
          selectedOptions,
          startIndex,
          maxOptionsPerMenu
        );
        components.push(new ActionRowBuilder().addComponents(selectMenu));
      }
    }

    // Add navigation buttons
    const navigationButtons = this.createNavigationButtons(
      category,
      questionIndex,
      isLastQuestion,
      hasMoreOptions,
      showBackToMain
    );
    components.push(...navigationButtons);

    return {
      content,
      components,
    };
  }

  /**
   * Get progress indicator for the current question
   * @param {string} userId - Discord user ID
   * @returns {string} Progress indicator string
   */
  getProgressIndicator(userId) {
    const userProgress = this.userProgressManager.getUserProgress(userId);
    if (!userProgress) return '';

    const { selectedGoals, currentCategoryIndex, currentQuestionIndex } = userProgress;
    const totalCategories = selectedGoals.length;

    // Calculate total questions across all selected categories
    let totalQuestions = 0;
    let completedQuestions = 0;

    for (let i = 0; i < selectedGoals.length; i++) {
      const goal = selectedGoals[i];
      const categoryMapping = categoryOrder.find((cat) => cat.triggerValue === goal);
      if (categoryMapping) {
        const categoryQuestions = questions[categoryMapping.category];
        if (categoryQuestions) {
          totalQuestions += categoryQuestions.length;
          if (i < currentCategoryIndex) {
            completedQuestions += categoryQuestions.length;
          } else if (i === currentCategoryIndex) {
            completedQuestions += currentQuestionIndex;
          }
        }
      }
    }

    const progressPercentage = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;

    return `\n\n📊 **Progress:** ${completedQuestions}/${totalQuestions} questions (${progressPercentage}%) | Category ${
      currentCategoryIndex + 1
    }/${totalCategories}`;
  }
}
