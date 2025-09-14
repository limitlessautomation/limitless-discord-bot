/**
 * Google Apps Script for Discord Intake Form Integration
 * 
 * This script receives form data from the Discord bot and adds it to a Google Sheet.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Replace the contents of the script editor with this code
 * 4. Save the script
 * 5. Deploy as a web app:
 *    - Click Deploy > New deployment
 *    - Select Web app
 *    - Set "Execute as" to "Me" (your email)
 *    - Set "Who has access" to "Anyone" (or "Anyone within [your organization]")
 *    - Click Deploy
 *    - Copy the Web app URL
 * 6. Add the URL to your .env file as GOOGLE_APPS_SCRIPT_URL
 */

// Global variables
const SHEET_NAME = "Intake Form Responses";
const HEADER_ROW = [
  "Timestamp",
  "User ID", 
  "Username",
  "Goals",
  // Initial questions
  "What industry are you currently in or looking to join?",
  "What do you currently do for work?",
  // Job Seeker questions
  "Which of these describes your current career or business situation?",
  "What is your specific job search goal?",
  "What industry or career field are you currently in or interested in pursuing?",
  "How would you describe your current resume/portfolio?",
  // New Skills questions
  "What type of new skills are you most interested in learning?",
  // Product Development questions
  "What is your primary role or interest in product development?",
  "What phase(s) of the product development life cycle are you most interested in or currently focused on?",
  // Software Development questions
  "What's your current experience level with programming?",
  "What programming languages do you use or want to learn?",
  "What full-stack or monolithic stacks do you currently use?",
  "What frontend technologies do you currently use?",
  "What backend technologies do you currently use?",
  "What database technologies do you currently use?",
  "What cloud or DevOps technologies do you currently use?",
  // Project Advice questions
  "What is the main subject of your project?",
  "Where are you currently stuck or what kind of help do you need?",
  // Networking questions
  "What is your primary goal for networking?",
  "What specific roles or types of people are you looking to connect with?",
  // Mentoring questions
  "What are your primary motivations for mentoring or helping others?",
  "What areas of expertise are you most confident in sharing?",
  "What is your preferred way to help?",
  // Business Owner questions
  "What stage is your business currently in?",
  "What is your focus for business growth right now?",
  // Mental Health questions
  "On a scale of 1-5, how would you describe your current mental well-being?",
  "What are you currently doing to support your mental health?",
  "How would you rate your sense of purpose or spiritual fulfillment?",
  "What are your biggest challenges in improving your mental well-being?",
  "What type of resources or support would be most helpful to you?",
  // Physical Health questions
  "When it comes to your physical health and fitness, which statement resonates with you most?",
  "What are your primary goals for improving your physical health?",
  "What are you currently doing for your physical health and wellness?",
  "What is your current relationship with food and nutrition?",
  "What kind of support would be most helpful to you?",
  // Best Version questions
  "What does the 'best version of yourself' look like in your life?",
  "What is one major goal you want to achieve within the next 12 months?",
  "What do you believe is currently holding you back?"
];

/**
 * Main function to handle POST requests from Discord bot
 */
function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Log the received data for debugging
    Logger.log("Received data: " + JSON.stringify(data));
    
    // Handle test connections
    if (data.test === true) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Test connection successful",
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Process the form data
    const result = processFormData(data);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Form data processed successfully",
      row: result.row,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Log the error
    Logger.log("Error processing request: " + error.toString());
    
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Process form data and add to spreadsheet
 */
function processFormData(data) {
  // Get or create the spreadsheet
  const sheet = getOrCreateSheet();
  
  // Prepare the row data
  const rowData = prepareRowData(data);
  
  // Add the row to the sheet
  const row = sheet.getLastRow() + 1;
  sheet.getRange(row, 1, 1, rowData.length).setValues([rowData]);
  
  // Format the timestamp column
  sheet.getRange(row, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
  
  // Auto-resize columns for better readability
  sheet.autoResizeColumns(1, rowData.length);
  
  return { row: row };
}

/**
 * Get or create the target sheet
 */
function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Try to get the existing sheet
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    // Create the sheet if it doesn't exist
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    
    // Set up the header row
    sheet.getRange(1, 1, 1, HEADER_ROW.length).setValues([HEADER_ROW]);
    
    // Format the header row
    const headerRange = sheet.getRange(1, 1, 1, HEADER_ROW.length);
    headerRange.setBackground("#4a86e8")
               .setFontColor("white")
               .setFontWeight("bold")
               .setHorizontalAlignment("center");
    
    // Freeze the header row
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

/**
 * Prepare row data from form data
 */
function prepareRowData(data) {
  const rowData = [];
  
  // Add basic information
  rowData.push(data.timestamp || new Date().toISOString());
  rowData.push(data.userId || "-");
  rowData.push(data.username || "-");
  rowData.push(data.goals ? data.goals.join(", ") : "-");
  
  // Add initial questions responses
  rowData.push(getResponseValue(data, 'initial', 'industry') || "-");
  rowData.push(getResponseValue(data, 'initial', 'current_role') || "-");
  
  // Add job seeker responses
  rowData.push(getResponseValue(data, 'job-seeker', 'job_situation') || "-");
  rowData.push(getResponseValue(data, 'job-seeker', 'job_goal') || "-");
  rowData.push(getResponseValue(data, 'job-seeker', 'industry_field') || "-");
  rowData.push(getResponseValue(data, 'job-seeker', 'resume_portfolio') || "-");
  
  // Add new skills responses
  rowData.push(getResponseValue(data, 'new-skills', 'new_skills_type') || "-");
  
  // Add product development responses
  rowData.push(getResponseValue(data, 'product-development', 'product_development_role') || "-");
  rowData.push(getResponseValue(data, 'product-development', 'product_development_phase') || "-");
  
  // Add software development responses
  rowData.push(getResponseValue(data, 'software-development', 'programming_experience') || "-");
  rowData.push(getResponseValue(data, 'software-development', 'languages') || "-");
  rowData.push(getResponseValue(data, 'software-development', 'fullstack_stacks') || "-");
  rowData.push(getResponseValue(data, 'software-development', 'frontend_tech') || "-");
  rowData.push(getResponseValue(data, 'software-development', 'backend_tech') || "-");
  rowData.push(getResponseValue(data, 'software-development', 'database_tech') || "-");
  rowData.push(getResponseValue(data, 'software-development', 'cloud_devops_tech') || "-");
  
  // Add project advice responses
  rowData.push(getResponseValue(data, 'project-advice', 'project_subject') || "-");
  rowData.push(getResponseValue(data, 'project-advice', 'help_needed') || "-");
  
  // Add networking responses
  rowData.push(getResponseValue(data, 'networking', 'networking_goal') || "-");
  rowData.push(getResponseValue(data, 'networking', 'roles_to_connect') || "-");
  
  // Add mentoring responses
  rowData.push(getResponseValue(data, 'mentoring', 'mentoring_motivation') || "-");
  rowData.push(getResponseValue(data, 'mentoring', 'expertise_areas') || "-");
  rowData.push(getResponseValue(data, 'mentoring', 'preferred_help') || "-");
  
  // Add business owner responses
  rowData.push(getResponseValue(data, 'business-owner', 'business_stage') || "-");
  rowData.push(getResponseValue(data, 'business-owner', 'business_focus') || "-");
  
  // Add mental health responses
  rowData.push(getResponseValue(data, 'mental-health', 'mental_wellbeing_rating') || "-");
  rowData.push(getResponseValue(data, 'mental-health', 'mental_health_support') || "-");
  rowData.push(getResponseValue(data, 'mental-health', 'sense_of_purpose') || "-");
  rowData.push(getResponseValue(data, 'mental-health', 'biggest_challenge_mental') || "-");
  rowData.push(getResponseValue(data, 'mental-health', 'mental_health_resources') || "-");
  
  // Add physical health responses
  rowData.push(getResponseValue(data, 'physical-health', 'physical_health_statement') || "-");
  rowData.push(getResponseValue(data, 'physical-health', 'physical_health_goals') || "-");
  rowData.push(getResponseValue(data, 'physical-health', 'current_physical_activities') || "-");
  rowData.push(getResponseValue(data, 'physical-health', 'food_nutrition_relationship') || "-");
  rowData.push(getResponseValue(data, 'physical-health', 'physical_health_support') || "-");
  
  // Add best version responses
  rowData.push(getResponseValue(data, 'best-version', 'best_version_description') || "-");
  rowData.push(getResponseValue(data, 'best-version', 'one_major_goal') || "-");
  rowData.push(getResponseValue(data, 'best-version', 'biggest_obstacle') || "-");
  
  return rowData;
}

/**
 * Helper function to get response value from form data
 */
function getResponseValue(data, category, questionId) {
  if (!data.responses || !data.responses[category] || !data.responses[category][questionId]) {
    return null;
  }
  
  const response = data.responses[category][questionId];
  
  if (Array.isArray(response)) {
    return response.join(", ");
  }
  
  return response;
}

/**
 * Test function to verify the script is working
 * Run this function from the Apps Script editor to test
 */
function testScript() {
  const testData = {
    test: true,
    timestamp: new Date().toISOString(),
    message: "Test from Apps Script editor"
  };
  
  const result = processFormData(testData);
  Logger.log("Test completed. Row added: " + result.row);
}

/**
 * Setup function to initialize the spreadsheet
 * Run this function from the Apps Script editor to set up the sheet
 */
function setupSpreadsheet() {
  const sheet = getOrCreateSheet();
  Logger.log("Spreadsheet setup completed. Sheet name: " + sheet.getName());
}

/**
 * Get the web app URL for deployment
 */
function getWebAppURL() {
  const scriptId = ScriptApp.getScriptId();
  return "https://script.google.com/macros/s/" + scriptId + "/exec";
}
