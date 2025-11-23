/* 
  Copyright (c) 2025 Daniel Aistrop
  All Rights Reserved.

  Unauthorized copying, modification, distribution, or use of this file
  is strictly prohibited without written permission.
*/

const RULE_ID_START = 1;

/**
 * Turn patterns into redirect rules.
 * Each pattern redirects the main-frame request to /pages/blocked.html.
 */
function buildRulesFromPatterns(patterns) {
  const rules = [];
  let nextId = RULE_ID_START;

  for (const raw of patterns) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const isRegex = trimmed.startsWith("re:");

    const rule = {
      id: nextId++,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          // This must match web_accessible_resources
          extensionPath: "/pages/blocked.html"
        }
      },
      condition: {
        resourceTypes: ["main_frame"]
      }
    };

    if (isRegex) {
      // Strip "re:" prefix
      rule.condition.regexFilter = trimmed.slice(3);
    } else {
      // Simple filter (ABP-style substring)
      rule.condition.urlFilter = trimmed;
    }

    rules.push(rule);
  }

  return rules;
}

/**
 * Read patterns from storage and replace ALL dynamic rules.
 */
async function rebuildRulesFromStorage() {
  const { blockedPatterns = [] } = await chrome.storage.sync.get("blockedPatterns");

  const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeIds = currentRules.map((r) => r.id);
  const addRules = buildRulesFromPatterns(blockedPatterns);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: removeIds,
    addRules
  });

  console.log(
    `[SimpleSiteBlocker] Installed ${addRules.length} rules from ${blockedPatterns.length} patterns.`
  );
}

/**
 * On install/update, build rules once.
 * Dynamic rules are persisted across browser restarts, so we don't
 * need to rebuild them on every startup.
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log(`[SimpleSiteBlocker] onInstalled: ${details.reason} → rebuilding rules.`);
  rebuildRulesFromStorage();
});

/**
 * Whenever patterns change, rebuild rules.
 */
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.blockedPatterns) {
    console.log("[SimpleSiteBlocker] blockedPatterns changed → rebuilding rules.");
    rebuildRulesFromStorage();
  }
});
