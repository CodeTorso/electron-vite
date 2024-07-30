import { app, shell, BrowserWindow, globalShortcut, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindow;

function createWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  mainWindow = new BrowserWindow({
    roundedCorners: true,
    width: 800,
    height: 600,
    show: false,
    autoHideMenuBar: true,
    transparent: true,
    frame: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Center the window
  mainWindow.setPosition(Math.floor(width / 2 - 400), Math.floor(height / 2 - 300));

  // Close on clicking outside
  mainWindow.on('blur', () => {
    mainWindow.hide();
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  // ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  // Register global shortcut
  const ret = globalShortcut.register('Alt+G', () => {
    console.log('Shortcut triggered');
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });

  if (!ret) {
    console.log('Shortcut failed');
  } else {
    console.log('Shortcut registered!');
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  // Unregister the shortcut when the app is about to quit
  globalShortcut.unregisterAll();
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.