// 共用小工具：路徑、雜湊、計時、輸出。
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, "..", "..");
const P = {
  root: ROOT,
  editor: path.join(ROOT, "editor"),
  web: ROOT, // 網頁版與 Git 倉庫都在根目錄
  bundles: path.join(ROOT, "game-bundles"),
  verify: path.join(ROOT, "verify"),
  state: path.join(ROOT, "verify", "state.json"),
  reports: path.join(ROOT, "verify", "reports"),
};
const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
const readJson = (f, fallback) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return fallback; } };
const writeJson = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(v, null, 2) + "\n"); };
const state = () => readJson(P.state, {});
const saveState = (patch) => writeJson(P.state, { ...state(), ...patch });
module.exports = { P, sha256, readJson, writeJson, state, saveState };
