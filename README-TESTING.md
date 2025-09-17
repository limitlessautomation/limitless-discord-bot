# Testing Strategy with Railway

## 🌿 Branch Strategy

- **`main`** - Production code (stable, deployed to live bot)
- **`test-features`** - Testing/development code (deployed to test bot)

## 🚂 Railway Deployment Options

### Option 1: Separate Test Project (Recommended)
1. Create new Railway project
2. Connect to same GitHub repo
3. Set branch to `test-features`
4. Use test Discord bot token
5. Deploy to separate test server

### Option 2: Switch Existing Project
1. Go to Railway project settings
2. Change source branch from `main` to `test-features`
3. Redeploy
4. Switch back to `main` when testing complete

## 🤖 Discord Bot Setup

### Test Bot Requirements
1. Create separate Discord application at https://discord.com/developers/applications
2. Get bot token for test environment
3. Invite test bot to test server with same permissions as production bot
4. Configure Railway environment variables with test bot token

### Environment Variables for Test
```
DISCORD_TOKEN=your_test_bot_token_here
DISCORD_CLIENT_ID=your_test_bot_client_id_here
# Copy other vars from production but use test values where appropriate
```

## 🧪 Testing Workflow

1. **Make changes** on `test-features` branch
2. **Push to GitHub**: `git push origin test-features`
3. **Railway auto-deploys** test bot
4. **Test functionality** in test server
5. **When satisfied**, merge to `main` for production deployment

## 🔄 Merging to Production

When testing is complete and everything works:

```bash
git checkout main
git merge test-features
git push origin main
```

This will deploy the tested changes to production.

## 🛡️ Safety Benefits

- Production bot never goes down during testing
- Can test with real Discord API without affecting users
- Easy rollback if issues found
- Parallel development possible
