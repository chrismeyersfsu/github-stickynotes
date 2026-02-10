const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const { Octokit } = require('@octokit/rest');
const config = require('./config');

let mainWindow;
let octokit;
let lastCheckedTime = new Date();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets/icon.png')
  });

  mainWindow.loadFile('index.html');

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Initialize GitHub API
  if (config.githubToken) {
    octokit = new Octokit({
      auth: config.githubToken
    });
  }

  // Check for new replies every 5 minutes
  setInterval(() => {
    if (octokit) {
      checkForNewReplies();
    }
  }, 5 * 60 * 1000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('get-conversations', async () => {
  if (!octokit) {
    throw new Error('GitHub token not configured');
  }

  try {
    const user = await octokit.users.getAuthenticated();
    const username = user.data.login;

    // Get issues and PRs the user has participated in
    const searchQuery = `involves:${username} is:open sort:updated-desc`;
    
    const [issues, pullRequests] = await Promise.all([
      octokit.search.issuesAndPullRequests({
        q: `${searchQuery} is:issue`,
        per_page: 50
      }),
      octokit.search.issuesAndPullRequests({
        q: `${searchQuery} is:pr`,
        per_page: 50
      })
    ]);

    const conversations = [...issues.data.items, ...pullRequests.data.items]
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .map(item => ({
        id: item.id,
        number: item.number,
        title: item.title,
        url: item.html_url,
        repository: item.repository_url.split('/').slice(-2).join('/'),
        updated_at: item.updated_at,
        state: item.state,
        type: item.pull_request ? 'pull_request' : 'issue',
        comments: item.comments,
        user: item.user.login,
        labels: item.labels.map(l => l.name)
      }));

    return conversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
});

ipcMain.handle('get-conversation-comments', async (event, owner, repo, number, type) => {
  if (!octokit) {
    throw new Error('GitHub token not configured');
  }

  try {
    const endpoint = type === 'pull_request' 
      ? octokit.pulls.listReviewComments
      : octokit.issues.listComments;

    const comments = await endpoint({
      owner,
      repo,
      issue_number: number,
      per_page: 100
    });

    return comments.data.map(comment => ({
      id: comment.id,
      user: comment.user.login,
      body: comment.body,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      html_url: comment.html_url
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
});

async function checkForNewReplies() {
  try {
    const user = await octokit.users.getAuthenticated();
    const username = user.data.login;

    const notifications = await octokit.activity.listNotificationsForAuthenticatedUser({
      since: lastCheckedTime.toISOString(),
      participating: true
    });

    notifications.data.forEach(notification => {
      if (notification.reason === 'comment' || notification.reason === 'mention') {
        showNotification(notification.subject.title, notification.repository.full_name);
      }
    });

    lastCheckedTime = new Date();
  } catch (error) {
    console.error('Error checking for new replies:', error);
  }
}

function showNotification(title, repo) {
  if (Notification.isSupported()) {
    new Notification({
      title: `New reply in ${repo}`,
      body: title,
      icon: path.join(__dirname, 'assets/icon.png')
    }).show();
  }
}
