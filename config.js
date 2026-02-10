// Configuration file for GitHub StickyNotes
// To use this app, you need to create a GitHub Personal Access Token
// 
// Steps to create a token:
// 1. Go to https://github.com/settings/tokens
// 2. Click "Generate new token" -> "Generate new token (classic)"
// 3. Give it a name like "GitHub StickyNotes"
// 4. Select the following scopes:
//    - repo (Full control of private repositories)
//    - notifications (Access notifications)
// 5. Click "Generate token"
// 6. Copy the token and paste it below

const token = process.env.GITHUB_TOKEN || 'YOUR_GITHUB_TOKEN_HERE';

// Validate token is configured
if (!token || token === 'YOUR_GITHUB_TOKEN_HERE') {
  console.error('\n⚠️  ERROR: GitHub token not configured!');
  console.error('Please set GITHUB_TOKEN environment variable or update config.js');
  console.error('See README.md for instructions on how to create a token.\n');
}

module.exports = {
  // Replace 'YOUR_GITHUB_TOKEN_HERE' with your actual GitHub Personal Access Token
  githubToken: token,
  
  // Refresh interval in milliseconds (default: 5 minutes)
  refreshInterval: 5 * 60 * 1000,
  
  // Maximum number of conversations to fetch
  maxConversations: 50
};
