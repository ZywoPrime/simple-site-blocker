/* 
  Copyright (c) 2025 Daniel Aistrop
  All Rights Reserved.

  Unauthorized copying, modification, distribution, or use of this file
  is strictly prohibited without written permission.
*/


// options.js

const textarea = document.getElementById("patterns");
const saveBtn = document.getElementById("save");
const statusEl = document.getElementById("status");
const previewBody = document.getElementById("preview-body");
const examplesToggle = document.getElementById("examples-toggle");
const examplesBody = document.getElementById("examples-body");
const helpIcon = document.getElementById("help-icon");
const helpDialog = document.getElementById("help-dialog");
const helpClose = document.getElementById("help-close");

const DEFAULT_PATTERNS = [].join("\n");

function setStatus(msg, kind = "info") {
  statusEl.textContent = msg;
  statusEl.className = "status " + kind;
}

// Load saved patterns
chrome.storage.sync.get({ patterns: DEFAULT_PATTERNS }, ({ patterns }) => {
  textarea.value = patterns;
  renderPreview();
});

async function rebuildRulesFromPatterns(patternLines) {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map(r => r.id);

  const addRules = [];
  let nextId = 1;

  for (const raw of patternLines) {
    const line = raw.trim();
    if (!line) continue;

    const rule = {
      id: nextId++,
      priority: 1,
      action: { type: "block" },
      condition: {
        resourceTypes: ["main_frame", "sub_frame"]
      }
    };

    if (line.startsWith("re:")) {
      const pattern = line.slice(3);

      // validate regex so a bad pattern doesn't break everything
      try {
        // eslint-disable-next-line no-new
        new RegExp(pattern);
      } catch (e) {
        console.warn(`Skipping invalid regex "${line}":`, e);
        continue;
      }

      rule.condition.regexFilter = pattern;
    } else {
      let normalized = line
        .replace(/^\s*\*+/, "")            // trim leading *
        .replace(/^https?:\/\//i, "")      // strip protocol
        .replace(/^www\./i, "");           // strip www.

      if (!normalized) continue;

      rule.condition.urlFilter = "||" + normalized;
    }

    addRules.push(rule);
  }

  return chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules
  });
}

saveBtn.addEventListener("click", async () => {
  const rawText = textarea.value || "";
  const lines = rawText.split("\n");

  const trimmed = lines.map(l => l.trim()).filter(Boolean);

  setStatus("Saving…", "info");

  try {
    await chrome.storage.sync.set({ patterns: trimmed.join("\n") });
    await rebuildRulesFromPatterns(trimmed);
    setStatus("Saved and blocking list updated ✔", "ok");
  } catch (e) {
    console.error("Error updating rules", e);
    setStatus(
      "Error updating blocking rules: " + (e && e.message ? e.message : e),
      "error"
    );
  }

  renderPreview();
});

function describePattern(line) {
  if (!line.trim()) return "";

  if (line.startsWith("re:")) {
    const pattern = line.slice(3);
    return `Blocks any URL matching regex /${pattern}/`;
  }

  let normalized = line
    .replace(/^\s*\*+/, "")
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "");

  if (!normalized) {
    return "Empty or unsupported pattern.";
  }

  return `Blocks any URL containing "${normalized}" (e.g. https://…${normalized}…)`;
}

function renderPreview() {
  const lines = (textarea.value || "").split("\n");
  previewBody.innerHTML = "";

  lines.forEach(raw => {
    const line = raw.trim();
    if (!line) return;

    const row = document.createElement("div");
    row.className = "preview-row";

    const patternEl = document.createElement("div");
    patternEl.className = "preview-pattern";
    patternEl.textContent = line;

    const descEl = document.createElement("div");
    descEl.className = "preview-desc";
    descEl.textContent = describePattern(line);

    row.appendChild(patternEl);
    row.appendChild(descEl);
    previewBody.appendChild(row);
  });
}

textarea.addEventListener("input", () => {
  renderPreview();
  setStatus("");
});

// examples toggle
examplesToggle.addEventListener("click", () => {
  const open = examplesBody.classList.toggle("open");
  examplesToggle.classList.toggle("open", open);
  const labelSpan = examplesToggle.querySelector("span:nth-child(2)");
  if (labelSpan) {
    labelSpan.textContent = open ? "Hide examples" : "Show examples";
  }
});

// help dialog
helpIcon.addEventListener("click", () => {
  helpDialog.showModal();
});

helpClose.addEventListener("click", () => {
  helpDialog.close();
});
