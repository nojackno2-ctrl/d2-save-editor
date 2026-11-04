// 以既有設定檔重新開啟指定存檔的遊戲（存檔保留），用法：node relaunch.cjs run-druid-4 run-druid-5
const { spawn } = require("child_process"), path = require("path");
for (const d of process.argv.slice(2)) {
  const env = { ...process.env, H_OUT: path.join(__dirname, d), H_CLASS: d.split("-")[1], H_SPEED: "1", H_BOT: path.join(__dirname, "..", "..", "helper", "autobot.js") };
  delete env.ELECTRON_RUN_AS_NODE;
  spawn(process.env.ELECTRON_EXE || path.join(__dirname, "..", "..", "..", "editor", "node_modules", "electron", "dist", "electron.exe"), [__dirname], { env, detached: true, stdio: "ignore" }).unref();
  console.log("launched", d);
}
