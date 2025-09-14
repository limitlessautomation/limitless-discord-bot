# Google Sheets Integration Setup

This guide will help you set up the Google Sheets integration for your Discord intake form bot.

## Prerequisites

1. A Google account
2. Access to Google Sheets and Google Apps Script
3. Your Discord bot running with the updated code

## Setup Steps

### 1. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it something like "Discord Intake Form Responses"

### 2. Set Up Google Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code in the script editor
3. Copy the contents from `google-apps-script-template.gs` and paste it into the script editor
4. Save the script (click the floppy disk icon or press `Ctrl+S`)

### 3. Deploy as Web App

1. In the Apps Script editor, click **Deploy > New deployment**
2. Select **Web app** as the deployment type
3. Configure the deployment settings:
   - **Description**: "Discord Intake Form Webhook"
   - **Execute as**: "Me" (your email address)
   - **Who has access**: 
     - For testing: "Anyone within [your organization]" (if using Google Workspace)
     - For production: "Anyone" (if you want it to be publicly accessible)
4. Click **Deploy**
5. **Authorize access**:
   - Click "Authorize access"
   - Select your Google account
   - You may see a "Google hasn't verified this app" warning - click "Advanced" then "Go to [your project name] (unsafe)"
   - Grant the necessary permissions
6. **Copy the Web app URL** - this is your `GOOGLE_APPS_SCRIPT_URL`

### 4. Configure Environment Variables

1. Copy the Web app URL from the deployment
2. Add it to your `.env` file:

```bash
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

3. Optional: Configure timeout and retry settings:

```bash
GOOGLE_APPS_SCRIPT_TIMEOUT=10000
GOOGLE_APPS_SCRIPT_RETRIES=3
```

### 5. Test the Integration

1. Restart your Discord bot
2. Complete an intake form in Discord
3. Check your Google Sheet - you should see a new row with the form responses

## Troubleshooting

### Common Issues

**1. "Cannot read properties of undefined" error**
- Make sure `GOOGLE_APPS_SCRIPT_URL` is set in your `.env` file
- Verify the URL is correct and accessible

**2. "Permission denied" errors**
- Check that your Google Apps Script deployment is set to "Anyone" or "Anyone within [your organization]"
- Ensure you've granted the necessary permissions when deploying

**3. No data appears in Google Sheet**
- Check the bot logs for any error messages
- Verify the Google Apps Script URL is correct
- Test the script by running the `testScript()` function in the Apps Script editor

**4. Web app URL not working**
- Redeploy the Google Apps Script
- Make sure you've copied the correct URL (it should end with `/exec`)
- Check that the deployment is active

### Testing the Google Apps Script

You can test the Google Apps Script directly:

1. Open the Apps Script editor
2. Select the `testScript` function from the dropdown menu
3. Click "Run"
4. Check the Google Sheet - a test row should be added
5. View the execution logs to see any errors

### Monitoring

- Check the Google Apps Script execution logs for any errors
- Monitor your Discord bot logs for Google Sheets integration messages
- Verify that new form submissions appear in your Google Sheet

## Security Considerations

- The Google Apps Script URL is essentially a public endpoint
- Anyone with the URL can send data to your Google Sheet
- Consider adding authentication if you need additional security
- Regularly check your Google Sheet for any unexpected entries

## Customization

### Modifying the Google Sheet Structure

You can customize the Google Sheet structure by modifying the `HEADER_ROW` array in the Google Apps Script:

```javascript
const HEADER_ROW = [
  "Timestamp",
  "User ID", 
  "Username",
  "Goals",
  // Add your custom headers here
];
```

### Adding Additional Categories

If you add new question categories to your Discord bot, update the `categories` array in the `prepareRowData` function:

```javascript
const categories = [
  "physical-health",
  "mental-health", 
  // Add your new categories here
];
```

### Custom Data Processing

You can modify the `prepareRowData` function to format the data differently or add additional processing logic.

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the Google Apps Script execution logs
3. Check your Discord bot logs
4. Verify all environment variables are set correctly
