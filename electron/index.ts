// Native
import { join } from 'path';

// Packages
import { BrowserWindow, app, ipcMain, IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import isDev from 'electron-is-dev';
import fs from 'fs';

const height = 600;
const width = 800;

async function handleLoadConfig() {
  const configPath = join(__dirname, 'config.json');
  // if config file not exist, create it
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, '{}');
  }

  const config = fs.readFileSync(configPath, 'utf-8');
  return JSON.stringify(config, null, 2);
}

function handleSaveConfig(_event: IpcMainInvokeEvent, args: any) {
  const configPath = join(__dirname, 'config.json');
  fs.writeFileSync(configPath, args);

  console.log(args);

  return args;
}

function createWindow() {
  // Create the browser window.
  const window = new BrowserWindow({
    width,
    height,
    show: true,
    resizable: true,
    fullscreenable: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js')
    }
  });

  const port = process.env.PORT || 3000;
  const url = isDev ? `http://localhost:${port}` : join(__dirname, '../src/out/index.html');

  // and load the index.html of the app.
  if (isDev) {
    window?.loadURL(url);
  } else {
    window?.loadFile(url);
  }
  // Open the DevTools.
  window.webContents.openDevTools({
    mode: 'detach'
  });

  // for config
  // ipcMain.on('loadConfig', () => {
  //   const configPath = join(__dirname, 'config.json');
  //   // if config file not exist, create it
  //   if (!fs.existsSync(configPath)) {
  //     fs.writeFileSync(configPath, '{}');
  //   }
  //
  //   const config = fs.readFileSync(configPath, 'utf-8');
  //   window.webContents.send('loadConfig', config);
  // });
  //
  // ipcMain.on('saveConfig', (_event: IpcMainEvent, config: string) => {
  //   const configPath = join(__dirname, 'config.json');
  //   fs.writeFileSync(configPath, config);
  //
  //   window.webContents.send('saveConfig', config);
  // });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle('loadConfig', () => handleLoadConfig());
  ipcMain.handle('saveConfig', (event, args) => handleSaveConfig(event, args));
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on('message', (event: IpcMainEvent, message: any) => {
  console.log(message);
  setTimeout(() => event.sender.send('message', 'hi from electron'), 500);
});
