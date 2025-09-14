// Shared form state management
import { FormQuestion, FormOption } from '../data/types';

// In-memory storage for active form messages and user completion status
export const activeFormMessages = new Map<string, string>(); // userId -> messageId
export const completedUsers = new Set<string>(); // userIds who have completed the form
export const initialSelectedOptions = new Map<string, Set<string>>(); // userId -> Set of selected option values

// Function to initialize the tracking variables (called from getform)
export function initializeFormTracking() {
  // No-op - variables are already initialized
}
