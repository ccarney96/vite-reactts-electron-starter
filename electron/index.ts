// Native
import { join } from 'path';

// Packages
import { BrowserWindow, app, ipcMain, IpcMainInvokeEvent, IpcMainEvent } from 'electron';
import isDev from 'electron-is-dev';
import fs from 'fs';
import { promisify } from 'util';
import sleep from '../src/lib/sleep';

const readFileAsync = promisify(fs.readFile);

class Lockfile {
  name: string;

  pid: string;

  port: string;

  password: string;

  protocol: string;

  version: string;

  region: string;

  shard: string;

  constructor(
    name: string,
    pid: string,
    port: string,
    password: string,
    protocol: string,
    version: string,
    region: string,
    shard: string
  ) {
    this.name = name;
    this.pid = pid;
    this.port = port;
    this.password = password;
    this.protocol = protocol;
    this.version = version;
    this.region = region;
    this.shard = shard;
  }
}

const height = 600;
const width = 800;

const getRegionAndShard = async (): Promise<{ region: string | undefined; shard: string | undefined }> => {
  const regionAndShardPath = `${process.env.LOCALAPPDATA}\\VALORANT\\Saved\\Logs\\ShooterGame.log`;

  try {
    if (fs.existsSync(regionAndShardPath)) {
      const target: string = await readFileAsync(regionAndShardPath, 'utf8');
      const lines: string[] = target.split('\n');

      const regionLine: string | undefined = lines.find((line) => line.includes('https://glz-'));
      const shardLine: string | undefined = regionLine?.split(' ').find((line) => line.includes('https://glz-'));

      if (shardLine) {
        const region: string | undefined = shardLine.split('-')[1];
        const shard: string | undefined = shardLine.split('-')[2].split('.')[1];

        console.log('region: ', region);
        console.log('shard: ', shard);
        return { region, shard };
      }
    }
  } catch (error) {
    console.error('Error reading or processing the log file:', error);
  }

  return { region: undefined, shard: undefined }; // Return undefined if the file doesn't exist or no region/shard line is found.
};
const getClientVersion = (): string | undefined => {
  const clientVersionPath = `${process.env.LOCALAPPDATA}\\VALORANT\\Saved\\Logs\\ShooterGame.log`;

  if (fs.existsSync(clientVersionPath)) {
    const target: string = fs.readFileSync(clientVersionPath, 'utf8');
    const lines: string[] = target.split('\n');

    const versionLine: string | undefined = lines.find((line) => line.includes('CI server version:'));

    if (versionLine) {
      const versionNumber: string = versionLine
        .split(' ')
        .slice(-1)[0]
        .replace(/[\r\n]/g, '');
      return versionNumber;
    }
  }

  return undefined; // Return undefined if the file doesn't exist or no version line is found.
};
async function getLockFile(): Promise<Lockfile | null> {
  const lockfilePath = `${process.env.LOCALAPPDATA}\\Riot Games\\Riot Client\\Config\\lockfile`;

  let lockfile: Lockfile | null = null;

  if (fs.existsSync(lockfilePath)) {
    // if the lockfile is found, then read and parse its data
    fs.readFile(lockfilePath, 'utf8', async (err, data) => {
      // handle any errors
      if (err) {
        console.error(err);
        return;
      }

      const version = await getClientVersion();
      const rs = await getRegionAndShard();

      console.log('version: ', version);
      console.log('rs: ', rs);

      // eslint-disable-next-line no-await-in-loop
      while (!version) await sleep(500);

      const lockfileDataArr = data.split(':');
      /**
       * The lockfile consist of:
       *  - name
       *  - pid
       *  - port
       *  - password
       *  - protocol
       */
      lockfile = new Lockfile(
        lockfileDataArr[0],
        lockfileDataArr[1],
        lockfileDataArr[2],
        lockfileDataArr[3],
        lockfileDataArr[4],
        version || '1',
        rs.region || '2',
        rs.shard || '3'
      );
    });
  }

  return lockfile;
}

async function handleLoadConfig() {
  const configPath = join(__dirname, 'config.json');
  // if config file not exist, create it
  if (!fs.existsSync(configPath)) {
    // create empty config file
    fs.writeFileSync(configPath, '{}');
  }

  const config = fs.readFileSync(configPath, 'utf-8');
  return config;
}

function handleSaveConfig(config: string) {
  console.log(config);
  const configPath = join(__dirname, 'config.json');
  fs.writeFileSync(configPath, config);
  return JSON.stringify(config);
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
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle('loadConfig', () => handleLoadConfig());
  ipcMain.handle('saveConfig', (_event: IpcMainInvokeEvent, config: string) => handleSaveConfig(config));
  ipcMain.handle('getLockfile', () => getLockFile());

  createWindow();

  app.on('activate', () => {
    // On macOS, it's common to re-create a window in the app when the
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
