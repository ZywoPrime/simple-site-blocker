/* 
  Copyright (c) 2025 Daniel Aistrop
  All Rights Reserved.

  Unauthorized copying, modification, distribution, or use of this file
  is strictly prohibited without written permission.
*/


async function rebuildRulesFromStorage() {
  const { blockedPatterns = [] } = await chrome.storage.sync.get("blockedPatterns");

  // Remove all existing dynamic rules
  const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
  const ruleIdsToRemove = currentRules.map(r => r.id);

  const rulesToAdd = [];
  let ruleId = 1;

  for (const raw of blockedPatterns) {
    const pattern = raw.trim();
    if (!pattern) continue;

    // Allow power-user regex with "re:", but let's ignore that for now.
    if (pattern.startsWith("re:")) {
      rulesToAdd.push({
        id: ruleId++,
        priority: 1,
        action: { type: "block" },
        condition: {
          regexFilter: pattern.slice(3),
          resourceTypes: ["main_frame", "sub_frame"],
        },
      });
      continue;
    }

    // --- Extract a hostname from whatever the user typed ---
    let host = pattern;

    // Strip leading "||" if user typed it
    if (host.startsWith("||")) host = host.slice(2);

    // If it looks like a full URL, use URL() to extract hostname
    if (host.includes("://")) {
      try {
        host = new URL(host).hostname;
      } catch (e) {
        // If URL parsing fails, fall back to original text
      }
    }

    // Remove any path/query/hash if user typed "helloWorld.com/something"
    host = host.split("/")[0].split("?")[0].split("#")[0];

    // Strip leading "www."
    host = host.replace(/^www\./i, "");

    // Very basic "does this look like a domain?" check: has at least one dot
    if (!host || !host.includes(".")) {
      // Skip weird entries like "porn" for now
      continue;
    }

    const urlFilter = "||" + host.toLowerCase();

    rulesToAdd.push({
      id: ruleId++,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter,
        resourceTypes: ["main_frame", "sub_frame"],
      },
    });
  }

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ruleIdsToRemove,
    addRules: rulesToAdd,
  });
}

// Build rules on install/update
chrome.runtime.onInstalled.addListener(() => {
  rebuildRulesFromStorage();
});

// Auto-refresh rules whenever the list changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes.blockedPatterns) {
    rebuildRulesFromStorage();
  }
});

// Turn the saved patterns into declarativeNetRequest rules
function buildRulesFromPatterns(patterns) {
  const rules = [];
  let nextId = 1;

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
        resourceTypes: ["main_frame"], // only redirect full-page loads
      },
    };

    if (isRegex) {
      // Strip "re:" and use regexFilter
      baseRule.condition.regexFilter = trimmed.slice(3);
    } else {
      // Simple substring/domain pattern
      baseRule.condition.urlFilter = trimmed;
    }

    rules.push(baseRule);
  }

  return rules;
}

async function rebuildRulesFromStorage() {
  const { blockedPatterns = [] } = await chrome.storage.sync.get("blockedPatterns");

  const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
  const ruleIdsToRemove = currentRules.map((r) => r.id);

  const rulesToAdd = buildRulesFromPatterns(blockedPatterns);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ruleIdsToRemove,
    addRules: rulesToAdd,
  });
}

// Build rules on install/update
chrome.runtime.onInstalled.addListener(() => {
  rebuildRulesFromStorage();
});

// Auto-refresh rules whenever the list changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes.blockedPatterns) {
    rebuildRulesFromStorage();
  }
});

