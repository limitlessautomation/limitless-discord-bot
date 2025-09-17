// 🟢 services/UserProgressManager.js
/**
 * Manages user form progress and state throughout the form completion process
 */
export class UserProgressManager {
  constructor() {
    // Store user form progress - Map<userId, progressData>
    this.userFormProgress = new Map();
  }

  /**
   * Initialize user progress for a new form session
   * @param {string} userId - Discord user ID
   * @param {string[]} selectedGoals - Array of selected goal categories
   */
  initializeUserProgress(userId, selectedGoals) {
    const progressData = {
      selectedGoals,
      currentCategoryIndex: 0,
      currentQuestionIndex: 0,
      responses: new Map(),
      selectedOptions: new Set()
    };
    
    this.userFormProgress.set(userId, progressData);
    console.log(`Initialized progress for user ${userId}:`, progressData);
    return progressData;
  }

  /**
   * Get user progress data
   * @param {string} userId - Discord user ID
   * @returns {Object|null} User progress data or null if not found
   */
  getUserProgress(userId) {
    return this.userFormProgress.get(userId);
  }

  /**
   * Update user progress data
   * @param {string} userId - Discord user ID
   * @param {Object} updates - Partial progress data to update
   */
  updateUserProgress(userId, updates) {
    const currentProgress = this.userFormProgress.get(userId);
    if (!currentProgress) {
      console.warn(`Attempted to update progress for non-existent user ${userId}`);
      return null;
    }

    const updatedProgress = { ...currentProgress, ...updates };
    this.userFormProgress.set(userId, updatedProgress);
    console.log(`Updated progress for user ${userId}:`, updates);
    return updatedProgress;
  }

  /**
   * Move to next category
   * @param {string} userId - Discord user ID
   */
  moveToNextCategory(userId) {
    const progress = this.getUserProgress(userId);
    if (!progress) return null;

    return this.updateUserProgress(userId, {
      currentCategoryIndex: progress.currentCategoryIndex + 1,
      currentQuestionIndex: 0,
      selectedOptions: new Set() // Reset selected options for new category
    });
  }

  /**
   * Move to next question within current category
   * @param {string} userId - Discord user ID
   */
  moveToNextQuestion(userId) {
    const progress = this.getUserProgress(userId);
    if (!progress) return null;

    return this.updateUserProgress(userId, {
      currentQuestionIndex: progress.currentQuestionIndex + 1,
      selectedOptions: new Set() // Reset selected options for new question
    });
  }

  /**
   * Add a response for the current question
   * @param {string} userId - Discord user ID
   * @param {string} questionKey - Question identifier
   * @param {any} response - User's response
   */
  addResponse(userId, questionKey, response) {
    const progress = this.getUserProgress(userId);
    if (!progress) return null;

    progress.responses.set(questionKey, response);
    console.log(`Added response for user ${userId}, question ${questionKey}:`, response);
    return progress;
  }

  /**
   * Add selected option for current question
   * @param {string} userId - Discord user ID
   * @param {string} option - Selected option
   */
  addSelectedOption(userId, option) {
    const progress = this.getUserProgress(userId);
    if (!progress) return null;

    progress.selectedOptions.add(option);
    console.log(`Added selected option for user ${userId}:`, option);
    return progress;
  }

  /**
   * Remove selected option for current question
   * @param {string} userId - Discord user ID
   * @param {string} option - Option to remove
   */
  removeSelectedOption(userId, option) {
    const progress = this.getUserProgress(userId);
    if (!progress) return null;

    progress.selectedOptions.delete(option);
    console.log(`Removed selected option for user ${userId}:`, option);
    return progress;
  }

  /**
   * Clear selected options for current question
   * @param {string} userId - Discord user ID
   */
  clearSelectedOptions(userId) {
    const progress = this.getUserProgress(userId);
    if (!progress) return null;

    progress.selectedOptions.clear();
    console.log(`Cleared selected options for user ${userId}`);
    return progress;
  }

  /**
   * Get all responses for a user
   * @param {string} userId - Discord user ID
   * @returns {Map|null} Map of responses or null if user not found
   */
  getUserResponses(userId) {
    const progress = this.getUserProgress(userId);
    return progress ? progress.responses : null;
  }

  /**
   * Check if user has completed all categories
   * @param {string} userId - Discord user ID
   * @returns {boolean} True if all categories are completed
   */
  isFormComplete(userId) {
    const progress = this.getUserProgress(userId);
    if (!progress) return false;

    return progress.currentCategoryIndex >= progress.selectedGoals.length;
  }

  /**
   * Clean up user progress (call when form is completed or abandoned)
   * @param {string} userId - Discord user ID
   */
  cleanupUserProgress(userId) {
    const existed = this.userFormProgress.delete(userId);
    if (existed) {
      console.log(`Cleaned up progress for user ${userId}`);
    }
    return existed;
  }

  /**
   * Get current category information
   * @param {string} userId - Discord user ID
   * @returns {Object|null} Current category info or null
   */
  getCurrentCategoryInfo(userId) {
    const progress = this.getUserProgress(userId);
    if (!progress) return null;

    const { selectedGoals, currentCategoryIndex } = progress;
    if (currentCategoryIndex >= selectedGoals.length) return null;

    return {
      currentGoal: selectedGoals[currentCategoryIndex],
      categoryIndex: currentCategoryIndex,
      totalCategories: selectedGoals.length
    };
  }

  /**
   * Get debug information for a user's progress
   * @param {string} userId - Discord user ID
   * @returns {Object|null} Debug information
   */
  getDebugInfo(userId) {
    const progress = this.getUserProgress(userId);
    if (!progress) return null;

    return {
      userId,
      selectedGoals: progress.selectedGoals,
      currentCategoryIndex: progress.currentCategoryIndex,
      currentQuestionIndex: progress.currentQuestionIndex,
      totalResponses: progress.responses.size,
      selectedOptionsCount: progress.selectedOptions.size,
      isComplete: this.isFormComplete(userId)
    };
  }
}

// Export singleton instance
export const userProgressManager = new UserProgressManager();
