// 網頁版：修改器跑在遊戲頁面上的 iframe 裡，存檔讀寫交給遊戲頁面（d2edit.js）處理。
// 桌面版已經由 preload.js 提供 window.api，這裡就什麼都不做。
(function () {
  if (window.api || window.parent === window) return;
  const GAME = "https://d2survivors.lol";
  const target = new URLSearchParams(location.search).get("origin") || GAME;
  let seq = 0;
  const waiting = new Map();
  window.addEventListener("message", (e) => {
    if (e.origin !== target || !e.data || e.data.d2edit !== "reply") return;
    const w = waiting.get(e.data.id);
    if (!w) return;
    waiting.delete(e.data.id);
    w(e.data.result);
  });
  const rpc = (fn, args) => new Promise((resolve) => {
    const id = ++seq;
    waiting.set(id, resolve);
    window.parent.postMessage({ d2edit: "call", id, fn, args }, target);
  });

  // 備份在網頁版改成下載檔案（不在遊戲網站留下任何東西）
  function download(name, text) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  const stamp = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  const remote = ["load", "save", "assets", "i18n", "engine", "traces", "diag"];
  const api = Object.fromEntries(remote.map((fn) => [fn, (...args) => rpc(fn, args)]));
  Object.assign(api, {
    web: true,
    async snapshot(save, label) {
      const text = await rpc("sealText", [save]);
      download(`D2倖存者_${String(label || "快照").replace(/[\\/:*?"<>|]/g, "_")}_${stamp()}.json`, text);
      return { ok: true };
    },
    async exportSave(save) {
      const text = await rpc("sealText", [save]);
      download(`D2倖存者存檔_${stamp()}.json`, text);
      return { ok: true, path: "下載資料夾" };
    },
    // 要在點擊當下開檔案選擇器，所以不能先 await
    importSave() {
      return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json,application/json";
        input.onchange = async () => {
          try {
            const save = JSON.parse(await input.files[0].text());
            resolve(typeof save?.version === "number" ? { save } : { error: "不是 D2 倖存者的存檔。" });
          } catch (e) { resolve({ error: "檔案讀取失敗：" + e.message }); }
        };
        input.click();
      });
    },
    listBackups: async () => [],
    readBackup: async () => ({ error: "網頁版的備份是下載的檔案，請用「從檔案匯入」。" }),
    deleteBackup: async () => ({ ok: true }),
    openBackups: async () => {},
    close: () => rpc("close", []),
  });
  window.api = api;
})();
