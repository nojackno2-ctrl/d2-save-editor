const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const { P, readJson } = require("./util.cjs");
const rules = [
  ["存檔與修改器", /\b(save|stash|inventory|item|gear|equip|socket|affix|rune|runeword|unique|craft|gold|stat|resistan|damage|life|mana|skill|level|difficult|terror)\w*/i],
  ["自動戰鬥與任務", /\b(skill|quest|level|monster|boss|enemy|enem|loot|drop|potion|combat|attack|damage|life|mana|death|portal|camp|town|class|hero|difficulty|terror|map|act|movement)\w*/i],
  ["翻譯與介面", /\b(text|language|translat|display|interface|menu|button|tooltip|description|filter|news|changelog)\w*/i],
];
function analyze(previous, current, prior) {
  const read = (build) => build ? readJson(path.join(P.bundles, build, "changelog.json"), null) : null;
  const now = read(current), old = read(previous);
  if (!Array.isArray(now)) return { ok: false, reason: "缺少新版官方更新日誌" };
  const lines = (list) => (list || []).flatMap((entry) => (entry.lines || []).filter((line) => typeof line.text === "string" && line.text.trim()).map((line) => ({ build: entry.build, kind: line.kind || "", text: line.text })));
  const oldKeys = new Set(lines(old).map((line) => line.text));
  const previousReviews = new Map((prior?.build === current ? prior.items : [])?.map((item) => [item.id, item]) || []);
  const items = lines(now).filter((line) => !oldKeys.has(line.text)).map((line) => {
    const id = crypto.createHash("sha256").update(line.text).digest("hex");
    const saved = previousReviews.get(id), areas = rules.filter(([, re]) => re.test(line.text)).map(([area]) => area);
    return { id, ...line, areas: areas.length ? areas : ["待判定"], status: saved?.status === "已完成" && typeof saved.evidence === "string" && saved.evidence.trim() ? "已完成" : "待分析", evidence: saved?.evidence || "" };
  });
  return { ok: true, build: current, baseline: previous || null, baselineComplete: Array.isArray(old), items, pending: items.filter((item) => item.status !== "已完成").length };
}
module.exports = { analyze };
