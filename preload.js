const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getConversations: () => ipcRenderer.invoke('get-conversations'),
  getConversationComments: (owner, repo, number, type) => 
    ipcRenderer.invoke('get-conversation-comments', owner, repo, number, type),
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
});
