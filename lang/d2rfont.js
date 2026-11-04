// 僅讀取玩家選擇的安裝資料夾，不修改 CASC 檔案。
export async function extractD2rFont(root) {
  const decoder = new TextDecoder();
  const hex = b => Array.from(b, x => x.toString(16).padStart(2, "0")).join("");
  async function file(dir, parts) {
    for (const part of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(part);
    return (await dir.getFileHandle(parts.at(-1))).getFile();
  }
  const bytes = async f => new Uint8Array(await f.arrayBuffer());
  const view = b => new DataView(b.buffer, b.byteOffset, b.byteLength);
  const text = async (dir, parts) => decoder.decode(await bytes(await file(dir, parts)));
  const rows = (await text(root, [".build.info"])).trim().split(/\r?\n/).map(x => x.split("|"));
  const headers = rows.shift().map(x => x.split("!")[0].trim());
  const row = rows.find(x => x[headers.indexOf("Active")] === "1");
  const key = row?.[headers.indexOf("Build Key")];
  if (!/^[a-f\d]{32}$/i.test(key || "")) throw Error("找不到啟用中的 D2R 版本");
  const config = await text(root, ["Data", "config", key.slice(0, 2), key.slice(2, 4), key]);
  const getConfig = name => new RegExp(`^${name}\\s*=\\s*(.+)$`, "m").exec(config)?.[1].trim();
  const rootKey = getConfig("root"), encodingKey = getConfig("encoding")?.split(/\s+/)[1];
  if (!rootKey || !encodingKey) throw Error("D2R 設定缺少索引");
  const dir = await (await root.getDirectoryHandle("Data")).getDirectoryHandle("data");
  const index = new Map();
  for await (const [name, handle] of dir.entries()) {
    if (!name.endsWith(".idx") || handle.kind !== "file") continue;
    const b = await bytes(await handle.getFile()), v = view(b), end = 40 + v.getUint32(32, true);
    for (let i = 40; i + 18 <= end && i + 18 <= b.length; i += 18) {
      let n = 0n; for (let j = 9; j < 14; j++) n = (n << 8n) | BigInt(b[i + j]);
      index.set(hex(b.subarray(i, i + 9)), [Number(n >> 30n), Number(n & 0x3fffffffn), v.getUint32(i + 14, true)]);
    }
  }
  async function decodeChunk(b) {
    if (b[0] === 78) return b.subarray(1);
    if (b[0] !== 90) throw Error("不支援的 BLTE 壓縮格式");
    const stream = new Blob([b.subarray(1)]).stream().pipeThrough(new DecompressionStream("deflate"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  async function read(key) {
    const loc = index.get(key.slice(0, 18));
    if (!loc) throw Error("找不到 CASC 資料");
    const f = await (await dir.getFileHandle("data." + String(loc[0]).padStart(3, "0"))).getFile();
    const b = new Uint8Array(await f.slice(loc[1] + 30, loc[1] + loc[2]).arrayBuffer()), v = view(b);
    if (decoder.decode(b.subarray(0, 4)) !== "BLTE") throw Error("無效的 BLTE 資料");
    const header = v.getUint32(4), chunks = [];
    if (!header) return decodeChunk(b.subarray(8));
    const count = (b[9] << 16) | (b[10] << 8) | b[11];
    let pos = header;
    for (let i = 0; i < count; i++) { const size = v.getUint32(12 + i * 24); chunks.push(await decodeChunk(b.subarray(pos, pos + size))); pos += size; }
    const result = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
    let off = 0; for (const chunk of chunks) { result.set(chunk, off); off += chunk.length; } return result;
  }
  const enc = await read(encodingKey), ev = view(enc), pages = ev.getUint32(9), spec = ev.getUint32(18);
  const mapping = new Map(); let pos = 22 + spec + pages * 32;
  for (let p = 0; p < pages; p++) { const end = pos + 4096; while (pos < end && enc[pos]) { const count = enc[pos]; mapping.set(hex(enc.subarray(pos + 6, pos + 22)), hex(enc.subarray(pos + 22, pos + 38))); pos += 22 + count * 16; } pos = end; }
  const rootEncoding = mapping.get(rootKey); if (!rootEncoding) throw Error("找不到 CASC 根目錄");
  const manifest = decoder.decode(await read(rootEncoding));
  const entry = manifest.split(/\r?\n/).map(x => x.split("|")).find(x => x[0]?.toLowerCase() === "data:data/hd/ui/fonts/blizzardglobaltcunicode.ttf");
  const fontKey = entry && mapping.get(entry[1]); if (!fontKey) throw Error("找不到 D2R 繁中字型");
  return read(fontKey);
}
