import fetch from 'node-fetch';

async function testAccountAccess() {
  const username = 'limitless_automation';
  const profileUrl = `https://www.tiktok.com/@${username}`;
  
  console.log(`🧪 Testing account access for: @${username}`);
  console.log(`📡 Profile URL: ${profileUrl}`);
  
  try {
    console.log(`🔍 Fetching profile page...`);
    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log(`📊 Response status: ${response.status}`);
    
    if (response.ok) {
      const html = await response.text();
      
      // Check for common indicators
      const hasLiveData = html.includes('isLive') || html.includes('LIVE') || html.includes('live');
      const hasUserData = html.includes('user-data') || html.includes('userInfo');
      
      console.log(`✅ Profile page accessible`);
      console.log(`📄 Page length: ${html.length} characters`);
      console.log(`🔥 Contains live indicators: ${hasLiveData}`);
      console.log(`👤 Contains user data: ${hasUserData}`);
      
      if (hasLiveData) {
        console.log(`🎉 GOOD: Account appears to support live streaming`);
      } else {
        console.log(`⚠️  WARNING: No live indicators found on profile page`);
      }
      
    } else {
      console.log(`❌ Failed to fetch profile: ${response.status} ${response.statusText}`);
    }
    
  } catch (error) {
    console.error(`❌ Error testing account access:`, error.message);
  }
}

testAccountAccess();
