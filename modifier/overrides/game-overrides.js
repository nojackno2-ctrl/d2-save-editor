//
在工具包載入時自動覆蓋遊戲防修改機制的腳本
(function() {
  // 儲存原始函式
  const originalSaveFaults = window.__saveFaults;
  const originalPageCheck = window.ie || window.re;
  const originalItemFault = window.__itemFault;

  // 覆蓋遊戲的存檔檢查函式
  if (typeof window.__saveFaults === 'function') {
    window.__saveFaults = function(save, maxIssues) {
      // 完全跳過遊戲的存檔檢查，返回空陣列（表示沒有問題）
      return [];
    };

    console.log('[D2 工具包] 已覆蓋遊戲存檔檢查函式 __saveFaults');
  }

  // 覆蓋頁面環境檢查
  if (typeof window.ie === 'function' || typeof window.re === 'function') {
    const pageChecker = window.ie || window.re;

    window.ie = function(w) {
      // 始終返回 null（表示遊戲沒有偵測到異常）
      return null;
    };

    window.re = function(w) {
      // 始終返回 null（表示遊戲沒有偵測到異常）
      return null;
    };

    console.log('[D2 工具包] 已覆蓋頁面環境檢查函式 ie/re');
  }

  // 覆蓋物品合法性檢查
  if (typeof window.__itemFault === 'function') {
    window.__itemFault = function(item) {
      // 始終返回 null（表示物品合法）
      return null;
    };

    console.log('[D2 工具包] 已覆蓋物品合法性檢查函式 __itemFault');
  }

  // 覆蓋遊戲頁面診斷顯示
  if (typeof window.gameSeesPage === 'function') {
    window.gameSeesPage = function(w) {
      // 始終返回沒有問題的狀態
      return { text: null, replaced: [], zh: !!w.__D2ZH };
    };

    console.log('[D2 工具包] 已覆蓋遊戲頁面診斷函式 gameSeesPage');
  }

  // 擋住遊戲對 localStorage 的寫入（避免遊戲檢查後重新寫入）
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    // 避免遊戲在載入過程中修改存檔
    if (key === 'd2-survivors/save/v1' || key === 'd2-survivors/hc/v1') {
      console.log('[D2 工具包] 擋住遊戲對存檔的寫入:', key);
      return;
    }
    return originalSetItem.call(this, key, value);
  };

  // 自訂檢查函式：用來顯示工具包的狀態
  window.__d2toolkitOverride = {
    isOverridden: true,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    overrides: [
      '__saveFaults',
      'ie',
      're',
      '__itemFault',
      'gameSeesPage'
    ]
  };

  console.log('[D2 工具包] 防修改機制已完全啟用');
})();
