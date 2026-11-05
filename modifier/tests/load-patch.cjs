// 測試用：把網頁版的 patch.mjs（ES module，結尾多一行 export）當成 CommonJS 載入，取得 patch 函式。
// 與桌面啟動器 editor/engine.js 的做法相同，因此測的是同一份程式。
const fs = require("node:fs"), os = require("node:os"), path = require("node:path");
module.exports = function loadPatch() {
  const src = fs.readFileSync(path.join(__dirname, "..", "patch.mjs"), "utf8").replace(/\r?\nexport const patch = self\.D2Patch\.patch;\s*$/, "");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "d2patch-"));
  const file = path.join(dir, "patch.js");
  fs.writeFileSync(file, src);
  return require(file).patch;
};
