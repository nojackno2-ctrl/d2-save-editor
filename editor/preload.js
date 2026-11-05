const { contextBridge, ipcRenderer } = require("electron");

const call = (ch) => (...args) => ipcRenderer.invoke(ch, ...args);
contextBridge.exposeInMainWorld("api", {
  // 啟動器協定版本：IPC 不相容時頁面可提示使用者下載新版 exe
  launcher: { protocol: 1 },
  load: call("load"),
  save: call("save"),
  assets: call("assets"),
  engine: call("engine"),
  i18n: call("i18n"),
  openBackups: call("openBackups"),
  traces: call("traces"),
  diag: call("diag"),
  listBackups: call("listBackups"),
  readBackup: call("readBackup"),
  deleteBackup: call("deleteBackup"),
  snapshot: call("snapshot"),
  exportSave: call("exportSave"),
  importSave: call("importSave"),
});
