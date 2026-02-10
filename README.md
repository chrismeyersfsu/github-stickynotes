# GitHub StickyNotes 🗒️

A desktop application built with Electron that displays your GitHub conversations (issues and pull requests) as sticky notes. Get notified when there are new replies to conversations you're participating in.

## Features

- 📌 View all GitHub issues and PRs you've recently interacted with as sticky notes
- 🔔 Get desktop notifications for new replies
- 🔄 Auto-refresh every 5 minutes to check for updates
- 🎨 Beautiful, color-coded sticky notes (yellow for issues, blue for PRs)
- 🔍 Filter by issues or pull requests
- 🚀 Quick access to open conversations directly in GitHub

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A GitHub Personal Access Token

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure GitHub Token

You need to create a GitHub Personal Access Token to use this app:

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name like "GitHub StickyNotes"
4. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `notifications` (Access notifications)
5. Click "Generate token"
6. Copy the token

Then, either:

**Option A:** Set an environment variable (recommended)
```bash
export GITHUB_TOKEN=your_token_here
```

**Option B:** Edit `config.js` and replace `YOUR_GITHUB_TOKEN_HERE` with your token

## Running the App

```bash
npm start
```

## Building the App

Build for your current platform:
```bash
npm run build
```

Build for specific platforms:
```bash
npm run build:mac    # macOS
npm run build:win    # Windows
npm run build:linux  # Linux
```

The built applications will be in the `dist/` directory.

## Usage

1. Launch the app
2. The app will automatically fetch your recent conversations from GitHub
3. Click the "🔄 Refresh" button to manually refresh
4. Use the checkboxes to filter between Issues and Pull Requests
5. Click "Open in GitHub" on any sticky note to view it in your browser
6. The app will check for new replies every 5 minutes and show desktop notifications

## Screenshots

The app displays your GitHub conversations in a beautiful sticky note interface, making it easy to track what needs your attention.

## Technology Stack

- **Electron** - Desktop application framework
- **@octokit/rest** - GitHub API client
- **HTML/CSS/JavaScript** - Frontend

## License

ISC
