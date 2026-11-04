const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const core = require("./core");
const engine = require("./engine");

const mode = (m) => (m === "hardcore" ? "hardcore" : "softcore");
const wrap = (fn) => async (_e, ...args) => {
  try {
    return await fn(...args);
  } catch (e) {
    return { error: e.message };
  }
};
const checkSave = (save) => {
  if (typeof save !== "object" || !save || typeof save.version !== "number") throw new Error("存檔格式不正確。");
};
let win;
const en = () => !app.getLocale().toLowerCase().startsWith("zh");

ipcMain.handle("load", wrap((m) => core.load(mode(m))));
ipcMain.handle("save", wrap(async (m, save) => {
  checkSave(save);
  return { ok: true, bytes: await core.store(mode(m), save) };
}));
ipcMain.handle("assets", () => core.assets());
ipcMain.handle("engine", wrap((fn, ...args) => {
  if (!["capabilities", "catalog", "generateMany", "faults", "saveFaults", "bases", "runewordBases", "affixOk", "rankDefs", "skillModDefs", "itemModMax", "affixInfo", "statRanges", "resolveName", "validateItems", "allowedStatsMany", "affixSlots"].includes(fn)) throw new Error("不支援的操作");
  return engine.call(fn, ...args);
}));
ipcMain.handle("i18n", () => core.i18n());
ipcMain.handle("openBackups", () => {
  fs.mkdirSync(core.BACKUP_DIR, { recursive: true });
  return shell.openPath(core.BACKUP_DIR);
});
ipcMain.handle("diag", wrap(() => core.diag()));
ipcMain.handle("traces", wrap((m, remove) => core.traces(mode(m), !!remove)));
ipcMain.handle("listBackups", wrap(() => core.listBackups()));
ipcMain.handle("readBackup", wrap((f) => ({ save: core.readBackup(f) })));
ipcMain.handle("deleteBackup", wrap((f) => (core.deleteBackup(f), { ok: true })));
ipcMain.handle("snapshot", wrap((save, label) => (checkSave(save), core.snapshot(save, label), { ok: true })));
ipcMain.handle("exportSave", wrap(async (save) => {
  checkSave(save);
  const r = await dialog.showSaveDialog(win, { title: en() ? "Export save" : "匯出存檔", defaultPath: en() ? "D2Survivors-save.json" : "D2倖存者存檔.json", filters: [{ name: en() ? "Save" : "存檔", extensions: ["json"] }] });
  if (r.canceled) return { canceled: true };
  core.writeFile(r.filePath, save);
  return { ok: true, path: r.filePath };
}));
ipcMain.handle("importSave", wrap(async () => {
  const r = await dialog.showOpenDialog(win, { title: en() ? "Import save" : "匯入存檔", filters: [{ name: en() ? "Save" : "存檔", extensions: ["json"] }], properties: ["openFile"] });
  if (r.canceled) return { canceled: true };
  const save = core.readFile(r.filePaths[0]);
  checkSave(save);
  return { save, path: r.filePaths[0] };
}));

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 1240,
    height: 880,
    title: en() ? "D2 Survivors Toolkit" : "D2倖存者工具包",
    backgroundColor: "#14110d",
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false },
  });
  win.loadFile(path.join(__dirname, "index.html"));
});
app.on("window-all-closed", () => app.quit());
