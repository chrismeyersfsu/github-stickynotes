const { ipcRenderer } = require('electron');

let conversations = [];
let filters = {
  issues: true,
  pullRequests: true
};

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadConversations();
});

function setupEventListeners() {
  document.getElementById('refresh-btn').addEventListener('click', loadConversations);
  document.getElementById('filter-issues').addEventListener('change', (e) => {
    filters.issues = e.target.checked;
    renderConversations();
  });
  document.getElementById('filter-prs').addEventListener('change', (e) => {
    filters.pullRequests = e.target.checked;
    renderConversations();
  });
}

async function loadConversations() {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error-message');
  const containerEl = document.getElementById('sticky-notes-container');

  loadingEl.style.display = 'block';
  errorEl.style.display = 'none';
  containerEl.innerHTML = '';

  try {
    conversations = await ipcRenderer.invoke('get-conversations');
    renderConversations();
    loadingEl.style.display = 'none';
  } catch (error) {
    loadingEl.style.display = 'none';
    errorEl.textContent = `Error: ${error.message}. Please check your GitHub token in config.js`;
    errorEl.style.display = 'block';
  }
}

function renderConversations() {
  const containerEl = document.getElementById('sticky-notes-container');
  containerEl.innerHTML = '';

  const filteredConversations = conversations.filter(conv => {
    if (conv.type === 'issue' && !filters.issues) return false;
    if (conv.type === 'pull_request' && !filters.pullRequests) return false;
    return true;
  });

  if (filteredConversations.length === 0) {
    containerEl.innerHTML = '<div class="empty-state">No conversations found. Try changing your filters or check your GitHub token.</div>';
    return;
  }

  filteredConversations.forEach(conv => {
    const note = createStickyNote(conv);
    containerEl.appendChild(note);
  });
}

function createStickyNote(conversation) {
  const note = document.createElement('div');
  note.className = `sticky-note ${conversation.type}`;
  
  const typeIcon = conversation.type === 'pull_request' ? '🔀' : '💬';
  const typeLabel = conversation.type === 'pull_request' ? 'PR' : 'Issue';
  
  const updatedDate = new Date(conversation.updated_at);
  const timeAgo = getTimeAgo(updatedDate);

  const labels = conversation.labels.length > 0
    ? `<div class="labels">${conversation.labels.map(l => `<span class="label">${l}</span>`).join('')}</div>`
    : '';

  note.innerHTML = `
    <div class="note-header">
      <span class="note-type">${typeIcon} ${typeLabel} #${conversation.number}</span>
      <span class="note-state state-${conversation.state}">${conversation.state}</span>
    </div>
    <div class="note-title">${escapeHtml(conversation.title)}</div>
    <div class="note-meta">
      <div class="note-repo">📁 ${conversation.repository}</div>
      <div class="note-author">👤 ${conversation.user}</div>
    </div>
    ${labels}
    <div class="note-footer">
      <span class="note-comments">💬 ${conversation.comments} comments</span>
      <span class="note-updated">🕐 ${timeAgo}</span>
    </div>
    <div class="note-actions">
      <button class="btn btn-small" onclick="openInBrowser('${conversation.url}')">Open in GitHub</button>
    </div>
  `;

  return note;
}

function openInBrowser(url) {
  require('electron').shell.openExternal(url);
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
