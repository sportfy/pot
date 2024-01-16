// src/main.js

// Import the required modules and dependencies
const { app, BrowserWindow } = require('electron');

// Define the main function to initialize the application
function createWindow() {
  // Create the application window
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Load the application's HTML file
  mainWindow.loadFile('index.html');

  // Set up event listeners
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });
}

// Start the application
app.on('ready', createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Activate the application (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
