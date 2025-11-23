/* 
  Copyright (c) 2025 Daniel Aistrop
  All Rights Reserved.

  Unauthorized copying, modification, distribution, or use of this file
  is strictly prohibited without written permission.
*/

(function () {
  const openOptionsBtn = document.getElementById("openOptions");
  const goBackBtn      = document.getElementById("goBack");

  console.log("[SimpleBlocker] blocked.js loaded, wiring buttons…");

  if (openOptionsBtn && chrome?.runtime?.openOptionsPage) {
    openOptionsBtn.addEventListener("click", () => {
      console.log("[SimpleBlocker] Open options clicked.");
      chrome.runtime.openOptionsPage();
    });
  }

  if (goBackBtn) {
    goBackBtn.addEventListener("click", () => {
      console.log("[SimpleBlocker] Back to safety clicked.");
      if (history.length > 1) {
        history.back();
      } else {
        window.location.href = "about:blank";
      }
    });
  }
})();
