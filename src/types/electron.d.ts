
/**
 * TypeScript type definitions for Electron APIs exposed to the renderer process
 */

interface ElectronAPI {
  ipcRenderer: {
    invoke: (channel: string, data?: any) => Promise<any>,
    send: (channel: string, data?: any) => void,
    on: (channel: string, func: (...args: any[]) => void) => () => void,
    once: (channel: string, func: (...args: any[]) => void) => void
  },
  fs: {
    readFileSync: (path: string, encoding: string) => string,
    writeFileSync: (path: string, data: string | NodeJS.ArrayBufferView) => void,
    existsSync: (path: string) => boolean,
    mkdirSync: (path: string) => void
  },
  path: {
    join: (...paths: string[]) => string,
    basename: (path: string) => string,
    dirname: (path: string) => string,
    extname: (path: string) => string
  }
}

declare interface Window {
  electron: ElectronAPI;
  process?: {
    versions: {
      electron?: string;
    }
  };
  require?: (module: string) => any;
}
