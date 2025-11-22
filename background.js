/* 
  Copyright (c) 2025 Daniel Aistrop
  All Rights Reserved.
*/

const RULE_ID_START = 1;

/* Convert patterns → redirect rules */
function buildRulesFromPatterns(patterns) {
  const rules = [];
  let nextId = RULE_ID_START;

  for (const raw of patterns) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const isRegex = trimmed.startsWith("re:");

    const baseRule = {
      id: nextId++,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          extensionPath: "/blocked.html"
        }
      },
      condition: {
        resourceTypes: ["main_frame"]
      }
    };

    if (isRegex) baseRule.condition.regexFilter = trimmed.slice(3);
    else baseRule.condition.urlFilter = trimmed;

    rules.push(baseRule);
  }

  return rules;
}

/* Rebuild rules — but DO NOT wipe if patterns unavailable */
async function rebuildRulesSafe() {
  const data = await chrome.storage.sync.get(null);

  if (!data || !("blockedPatterns" in data)) {
    console.warn("[SimpleBlocker] blockedPatterns not ready yet — skipping rebuild.");
    return false;
  }

  const patterns = data.blockedPatterns || [];

  const current = await chrome.declarativeNetRequest.getDynamicRules();
  const removeIds = current.map(r => r.id);
  const addRules = buildRulesFromPatterns(patterns);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: removeIds,
    addRules
  });

  console.log(`[SimpleBlocker] Rebuilt ${addRules.length} blocking rules.`);
  return true;
}

/* Ensure rules exist — if not, retry a few times */
async function ensureRules() {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();

  if (existing.length > 0) {
    console.log(`[SimpleBlocker] Rules already loaded (${existing.length}).`);
    return;
  }

  console.warn("[SimpleBlocker] No rules present — attempting rebuild.");

  let success = await rebuildRulesSafe();

  if (!success) {
    console.warn("[SimpleBlocker] Storage not ready. Retrying in 1 second…");
    setTimeout(async () => {
      let secondTry = await rebuildRulesSafe();
      if (!secondTry) {
        console.error("[SimpleBlocker] Could NOT rebuild rules — storage never loaded.");
      }
    }, 1000);
  }
}

/* On first install */
chrome.runtime.onInstalled.addListener(() => {
  console.log("[SimpleBlocker] onInstalled → force rebuild");
  rebuildRulesSafe();
});

/* On browser startup */
chrome.runtime.onStartup.addListener(() => {
  console.log("[SimpleBlocker] onStartup → ensure rules");
  ensureRules();
});

/* When patterns change */
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.blockedPatterns) {
    console.log("[SimpleBlocker] blockedPatterns changed — rebuilding rules.");
    rebuildRulesSafe();
  }
});

/* When service worker is created */
ensureRules();
