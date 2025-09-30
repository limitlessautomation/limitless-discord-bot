import { TikTokLiveConnection } from 'tiktok-live-connector';

async function testTikTokConnection() {
  const testUserId = '6782988280137925637';
  
  console.log(`🧪 Testing TikTok connection with User ID: ${testUserId}`);
  console.log(`📊 User ID validation:`);
  console.log(`   - Is numeric: ${!isNaN(testUserId)}`);
  console.log(`   - Length: ${testUserId.length}`);
  console.log(`   - Length > 5: ${testUserId.length > 5}`);
  
  try {
    const connection = new TikTokLiveConnection(testUserId, {
      enableExtendedGiftInfo: false,
      requestPollingIntervalMs: 2000,
    });
    
    console.log(`🔌 Attempting to connect...`);
    await connection.connect();
    console.log(`✅ Successfully connected! User ID is valid.`);
    
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
    
    // Provide specific guidance
    if (error.message.includes('user_not_found')) {
      console.log(`\n💡 TROUBLESHOOTING:`);
      console.log(`   The User ID '${testUserId}' was not found by TikTok.`);
      console.log(`   This could mean:`);
      console.log(`   1. The User ID is incorrect`);
      console.log(`   2. The account doesn't exist or is private`);
      console.log(`   3. The User ID format is wrong`);
      console.log(`\n📝 NEXT STEPS:`);
      console.log(`   1. Verify the User ID from your TikTok profile page`);
      console.log(`   2. Try using your @username instead`);
      console.log(`   3. Check if your account is public`);
    }
  }
}

testTikTokConnection().catch(console.error);
