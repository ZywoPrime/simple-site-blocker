/* 
  Copyright (c) 2025 Daniel Aistrop
  All Rights Reserved.

  Unauthorized copying, modification, distribution, or use of this file
  is strictly prohibited without written permission.
*/

// blocked.js
document.addEventListener("DOMContentLoaded", () => {
  const openOptionsBtn = document.getElementById("openOptions");
  const goBackBtn = document.getElementById("goBack");

  if (openOptionsBtn) {
    openOptionsBtn.addEventListener("click", () => {
      if (chrome.runtime && chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      }
    });
  }

  if (goBackBtn) {
    goBackBtn.addEventListener("click", () => {
      if (history.length > 1) {
        history.back();
      } else {
        window.location.href = "about:blank";
      }
    });
  }
});
