// Environment configuration
export const environment = {
  // Determine environment based on branch or explicit env var
  NODE_ENV: process.env.NODE_ENV || 'production',
  
  // Check if we're in development/testing mode
  isDevelopment: process.env.NODE_ENV === 'development' || 
                 process.env.RAILWAY_GIT_BRANCH === 'test-features',
  
  isProduction: process.env.NODE_ENV === 'production' || 
                process.env.RAILWAY_GIT_BRANCH === 'main',
  
  // Bot configuration
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
  },
  
  // Google Sheets configuration
  googleSheets: {
    scriptUrl: process.env.GOOGLE_APPS_SCRIPT_URL,
    timeout: parseInt(process.env.GOOGLE_APPS_SCRIPT_TIMEOUT || '10000'),
    retries: parseInt(process.env.GOOGLE_APPS_SCRIPT_RETRIES || '3'),
  },
  
  // TikTok Live configuration
  tiktok: {
    username: process.env.TIKTOK_USERNAME,
    // Doppler sets the appropriate channel ID for each environment
    liveAnnouncementChannelId: process.env.LIVE_ANNOUNCEMENT_CHANNEL_ID,
  },
  
  // Logging level based on environment
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
};

// Helper functions
export function isDev() {
  return environment.isDevelopment;
}

export function isProd() {
  return environment.isProduction;
}

// Log current environment on startup
console.log(`🌍 Environment: ${environment.NODE_ENV}`);
console.log(`🌿 Git Branch: ${process.env.RAILWAY_GIT_BRANCH || 'unknown'}`);
console.log(`🤖 Bot Mode: ${isDev() ? 'Development' : 'Production'}`);
