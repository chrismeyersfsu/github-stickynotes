// Simple test to validate GitHub API integration
// This tests the Octokit setup and conversation fetching logic

const { Octokit } = require('@octokit/rest');

async function testGitHubAPI() {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token || token === 'YOUR_GITHUB_TOKEN_HERE') {
    console.log('✗ No GitHub token configured');
    console.log('  Set GITHUB_TOKEN environment variable or update config.js');
    return false;
  }

  try {
    const octokit = new Octokit({ auth: token });
    
    // Test authentication
    console.log('Testing GitHub authentication...');
    const user = await octokit.users.getAuthenticated();
    console.log(`✓ Authenticated as: ${user.data.login}`);
    
    // Test fetching conversations
    console.log('\nFetching recent conversations...');
    const searchQuery = `involves:${user.data.login} is:open sort:updated-desc`;
    
    const issues = await octokit.search.issuesAndPullRequests({
      q: `${searchQuery} is:issue`,
      per_page: 5
    });
    
    const pullRequests = await octokit.search.issuesAndPullRequests({
      q: `${searchQuery} is:pr`,
      per_page: 5
    });
    
    console.log(`✓ Found ${issues.data.total_count} total issues`);
    console.log(`✓ Found ${pullRequests.data.total_count} total pull requests`);
    
    if (issues.data.items.length > 0) {
      console.log('\nSample issue:');
      const sample = issues.data.items[0];
      console.log(`  - ${sample.title}`);
      console.log(`  - ${sample.repository_url.split('/').slice(-2).join('/')}`);
    }
    
    if (pullRequests.data.items.length > 0) {
      console.log('\nSample PR:');
      const sample = pullRequests.data.items[0];
      console.log(`  - ${sample.title}`);
      console.log(`  - ${sample.repository_url.split('/').slice(-2).join('/')}`);
    }
    
    console.log('\n✓ GitHub API integration test passed!');
    return true;
  } catch (error) {
    console.error('✗ GitHub API test failed:', error.message);
    return false;
  }
}

testGitHubAPI();
