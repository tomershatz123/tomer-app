const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js') // Optional for security
    }
  });

  // During development, point to your React dev server
  win.loadURL('http://localhost:3000'); 
  
  // In production, you'd load the build file:
  // win.loadFile(path.join(__dirname, 'build/index.html'));
}

app.whenReady().then(createWindow);