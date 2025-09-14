import axios from 'axios';

class GoogleAppsScriptService {
  constructor(config) {
    this.config = {
      timeout: 10000, // 10 seconds default timeout
      retries: 3, // 3 retries default
      ...config,
    };
  }

  /**
   * Send form response data to Google Apps Script
   */
  async sendFormResponse(data) {
    const { scriptUrl, timeout, retries } = this.config;

    if (!scriptUrl) {
      throw new Error('Google Apps Script URL is not configured');
    }

    let lastError = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Attempting to send form data to Google Apps Script (attempt ${attempt}/${retries})`);

        const response = await axios.post(scriptUrl, {
          userId: data.userId,
          username: data.username,
          timestamp: data.timestamp.toISOString(),
          goals: data.goals,
          responses: data.responses,
        }, {
          timeout: timeout,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Form data successfully sent to Google Apps Script');
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);

        return; // Success, exit the retry loop
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error);

        if (attempt === retries) {
          break; // Last attempt failed, exit the loop
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s, etc.
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error(`Failed to send form data to Google Apps Script after ${retries} attempts. Last error: ${lastError?.message}`);
  }

  /**
   * Test the connection to Google Apps Script
   */
  async testConnection() {
    try {
      const { scriptUrl, timeout } = this.config;

      if (!scriptUrl) {
        throw new Error('Google Apps Script URL is not configured');
      }

      const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Connection test from Discord Bot',
      };

      const response = await axios.post(scriptUrl, testData, {
        timeout: timeout,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Google Apps Script connection test successful');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      return true;
    } catch (error) {
      console.error('Google Apps Script connection test failed:', error);
      return false;
    }
  }

  /**
   * Format form responses for Google Sheets
   */
  static formatForGoogleSheets(data) {
    const rows = [];

    // Add main row with user info and goals
    rows.push({
      userId: data.userId,
      username: data.username,
      timestamp: data.timestamp.toISOString(),
      goals: data.goals.join(', '),
      // Add empty columns for each category's responses
      ...this.getCategoryColumns(data.responses),
    });

    return rows;
  }

  /**
   * Get category columns for Google Sheets
   */
  static getCategoryColumns(responses) {
    const categoryColumns = {};

    Object.entries(responses).forEach(([category, categoryResponses]) => {
      Object.entries(categoryResponses).forEach(([questionId, answers]) => {
        const columnKey = `${category}_${questionId}`;
        categoryColumns[columnKey] = answers.join(', ');
      });
    });

    return categoryColumns;
  }
}

export default GoogleAppsScriptService;
