/* 
  Copyright (c) 2025 Daniel Aistrop
  All Rights Reserved.

  Unauthorized copying, modification, distribution, or use of this file
  is strictly prohibited without written permission.
*/

(function () {
  const btn = document.getElementById("open-options");
  if (!btn) {
    console.warn("[SimpleBlocker] popup.js: #open-options not found.");
    return;
  }

  btn.addEventListener("click", () => {
    console.log("[SimpleBlocker] Popup → open options clicked.");
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("pages/options.html"));
    }
  });
})();
