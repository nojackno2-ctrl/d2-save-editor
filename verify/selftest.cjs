// 驗證「驗證腳本自己會抓錯」：把快照複製到暫存，故意破壞，確認 analyze 真的會報錯（避免檢查形同虛設）。
// 用法：node verify/selftest.cjs [build]
const fs = require("node:fs"), path = require("node:path"), os = require("node:os"), assert = require("node:assert/strict");
const { P, state } = require("./lib/util.cjs");
const adapt = require("./lib/adapt.cjs");
const { verificationFingerprint } = require("./lib/fingerprint.cjs");

const build = process.argv[2] || state().lastVerified?.build || fs.readdirSync(P.bundles).sort().pop();
const src = path.join(P.bundles, build);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "d2-selftest-"));
const fresh = () => { const d = fs.mkdtempSync(path.join(tmp, "s-")); fs.cpSync(src, d, { recursive: true }); return d; };
const find = (d, prefix) => path.join(d, "assets", fs.readdirSync(path.join(d, "assets")).find((f) => f.startsWith(prefix) && f.endsWith(".js")));
const mutate = (d, prefix, fn) => { const f = find(d, prefix); fs.writeFileSync(f, fn(fs.readFileSync(f, "utf8"))); };

const cases = [
  ["原樣應通過", () => {}, (r) => assert.equal(r.ok, true, r.issues.join(";"))],
  ["拿掉 tick 特徵 → 掛鉤失效", (d) => mutate(d, "Game-", (s) => s.replaceAll("drinkFrom(", "drinkFromX(")), (r) => assert.equal(r.ok, false)],
  ["Game 方法改名 → 缺方法", (d) => mutate(d, "Game-", (s) => s.replaceAll("makePlayer(", "makeHero(")), (r) => assert.match(r.issues.join(), /makePlayer/)],
  ["技能表消失 → itemArt 找不到", (d) => mutate(d, "itemArt-", (s) => s.replaceAll("doubleSwing:{", "dblSwing:{")), (r) => assert.match(r.issues.join(), /itemArt/)],
  ["選卡函式特徵消失 → saveTransfer 找不到", (d) => mutate(d, "saveTransfer-", (s) => s.replaceAll("`attribute`", "`attr`")), (r) => assert.match(r.issues.join(), /saveTransfer/)],
];
let bad = 0;
for (const [name, mutateFn, check] of cases) {
  const d = fresh(); mutateFn(d);
  try { check(adapt.analyze(build, d)); console.log("  ✓", name); } catch (e) { bad++; console.log("  ✗", name, "→", e.message.split("\n")[0]); }
}
const stableFingerprint = verificationFingerprint();
const runOutput = path.join(P.editor, "tests", "live-harness", `run-fingerprint-${process.pid}`);
const reportOutput = path.join(P.reports, `fingerprint-selftest-${process.pid}.json`);
try {
  fs.mkdirSync(runOutput, { recursive: true }); fs.writeFileSync(path.join(runOutput, "status.json"), "{}\n");
  fs.writeFileSync(reportOutput, "{}\n");
  assert.equal(verificationFingerprint(), stableFingerprint, "報告及長跑執行輸出不得改變驗證來源指紋");
  console.log("  ✓ 報告與長跑輸出不影響來源指紋");
} catch (e) { bad++; console.log("  ✗ 指紋穩定性 →", e.message.split("\n")[0]); }
finally {
  if (fs.existsSync(runOutput)) fs.rmSync(runOutput, { recursive: true, force: true });
  if (fs.existsSync(reportOutput)) fs.rmSync(reportOutput, { force: true });
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(bad ? `自我檢查失敗 ${bad} 項` : `自我檢查通過 ${cases.length + 1} 項`);
process.exitCode = bad ? 1 : 0;
