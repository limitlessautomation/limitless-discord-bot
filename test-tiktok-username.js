import { TikTokLiveConnection } from 'tiktok-live-connector';

async function testTikTokUsername() {
  // Replace with your actual TikTok username (include the @ symbol)
  const testUsername = '@limitless_automation';
  
  console.log(`  Testing TikTok connection with Username: ${testUsername}`);
  
  try {
    const connection = new TikTokLiveConnection(testUsername, {
      enableExtendedGiftInfo: false,
      requestPollingIntervalMs: 2000,
    });
    
    console.log(`🔌 Attempting to connect...`);
    await connection.connect();
    console.log(`✅ Successfully connected! Username is valid.`);
    
    // Disconnect after successful test
    connection.disconnect();
    console.log(`🔌 Disconnected from test.`);
    
  } catch (error) {
    console.error(`❌ Connection failed:`);
    console.error(`   Error type: ${error.constructor.name}`);
    console.error(`   Error message: ${error.message}`);
    
    if (error.errors) {
      console.error(`   Detailed errors:`);
      error.errors.forEach((err, index) => {
        console.error(`     ${index + 1}. ${err.constructor.name}: ${err.message}`);
      });
    }
    
    // Check if it's because user is offline (which is good!)
    if (error.message.includes('isn\'t online') || error.message.includes('offline')) {
      console.log(`\n✅ GOOD NEWS: The username was found!`);
      console.log(`   The error just means you're not currently live.`);
      console.log(`   The bot will work when you go live.`);
    }
  }
}

// Replace '@your_username_here' with your actual TikTok username
testTikTokUsername().catch(console.error);
