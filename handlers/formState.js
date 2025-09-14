// Shared form state management

// In-memory storage for active form messages and user completion status
export const activeFormMessages = new Map(); // userId -> messageId
export const completedUsers = new Set(); // userIds who have completed the form
export const initialSelectedOptions = new Map(); // userId -> Set of selected option values

// Function to initialize the tracking variables (called from getform)
export function initializeFormTracking() {
  // No-op - variables are already initialized
}
