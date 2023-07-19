import { ipcRenderer, contextBridge } from 'electron';

declare global {
  interface Window {
    Main: typeof api;
    ipcRenderer: typeof ipcRenderer;
  }
}

const api = {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The function below can accessed using `window.Main.sayHello`
   */
  loadConfig: () => {
    return ipcRenderer.invoke('loadConfig').then((config) => {
      // Assuming config is a JSON object
      // You can process the config here if needed
      return config;
    });
  },
  saveConfig: (config: string) => {
    // eslint-disable-next-line no-shadow
    return ipcRenderer.invoke('saveConfig', config).then((config) => {
      // Assuming config is a JSON object
      // You can process the config here if needed
      return config;
    });
  },
  connectToWebsocket: () => {
    return ipcRenderer.invoke('connectToWebsocket').then((connected: boolean) => {
      console.log(connected);
      return connected;
    });
  },
  getLockfile: () => {
    return ipcRenderer.invoke('getLockfile').then((lockfile: string) => {
      console.log(lockfile);
      return lockfile;
    });
  },
  on: (channel: string, callback: (data: any) => void) => {
    ipcRenderer.on(channel, (_, data) => callback(data));
  }
};
contextBridge.exposeInMainWorld('Main', api);
/**
 * Using the ipcRenderer directly in the browser through the contextBridge ist not really secure.
 * I advise using the Main/api way !!
 */
contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);
