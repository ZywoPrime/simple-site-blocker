/* 
  Copyright (c) 2025 Daniel Aistrop
  All Rights Reserved.
*/

const RULE_ID_START = 1;

/**
 * Turn the saved patterns into declarativeNetRequest redirect rules
 * that send the user to /blocked.html inside this extension.
 */
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
          // blocked.html inside this extension
          extensionPath: "/blocked.html",
        },
      },
      condition: {
        resourceTypes: ["main_frame"], // only top-level pages
      },
    };

    if (isRegex) {
      // Strip "re:" and use regexFilter
      baseRule.condition.regexFilter = trimmed.slice(3);
    } else {
      // Simple pattern – use directly as urlFilter
      baseRule.condition.urlFilter = trimmed;
    }

    rules.push(baseRule);
  }

  return rules;
}

/**
 * Read patterns from storage and replace ALL dynamic rules with
 * redirect rules built from those patterns.
 */
async function rebuildRulesFromStorage() {
  const { blockedPatterns = [] } = await chrome.storage.sync.get("blockedPatterns");

  const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
  const ruleIdsToRemove = currentRules.map(r => r.id);
  const rulesToAdd = buildRulesFromPatterns(blockedPatterns);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ruleIdsToRemove,
    addRules: rulesToAdd,
  });

  console.log(
    `[SimpleBlocker] Rebuilt ${rulesToAdd.length} rules from ${blockedPatterns.length} patterns.`
  );
}

/**
 * On install/update, build rules once from whatever is in storage.
 * (Dynamic rules are persisted across browser restarts, so we do NOT
 * need to rebuild them on every startup.)
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log(`[SimpleBlocker] onInstalled: reason=${details.reason} — rebuilding rules.`);
  rebuildRulesFromStorage();
});

/**
 * Whenever the user changes patterns (via the options page), rebuild rules.
 */
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.blockedPatterns) {
    console.log("[SimpleBlocker] blockedPatterns changed — rebuilding rules.");
    rebuildRulesFromStorage();
  }
});
