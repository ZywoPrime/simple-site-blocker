/* 
  Copyright (c) 2025 Daniel Aistrop
  All Rights Reserved.

  Unauthorized copying, modification, distribution, or use of this file
  is strictly prohibited without written permission.
*/

// Small helper to normalise textarea → array of patterns
function getPatternsFromTextarea(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

// Build preview text for one pattern
function describePattern(pattern) {
  if (pattern.startsWith('re:')) {
    return `Regex match: ${pattern.slice(3)}`;
  }

  // Very simple guess: if it has a dot, treat as domain-ish, else substring
  if (pattern.includes('.')) {
    return `Blocks any URL containing "${pattern}" (e.g. https://…${pattern}…)`;
  }
  return `Blocks any URL containing "${pattern}" in the host or path.`;
}

function renderPreview(patterns) {
  const previewBody = document.getElementById('preview-body');
  if (!previewBody) return;

  previewBody.innerHTML = '';

  patterns.forEach(p => {
    const row = document.createElement('div');
    row.className = 'preview-row';

    const title = document.createElement('div');
    title.className = 'preview-pattern';
    title.textContent = p;

    const desc = document.createElement('div');
    desc.className = 'preview-desc';
    desc.textContent = describePattern(p);

    row.appendChild(title);
    row.appendChild(desc);
    previewBody.appendChild(row);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const textarea = document.getElementById('patterns');
  const statusEl = document.getElementById('status');
  const saveBtn = document.getElementById('save');
  const examplesToggle = document.getElementById('examples-toggle');
  const examplesBody = document.getElementById('examples-body');
  const helpIcon = document.getElementById('help-icon');
  const helpDialog = document.getElementById('help-dialog');
  const helpClose = document.getElementById('help-close');

  // Load existing patterns from sync storage
  try {
    const { blockedPatterns = [] } = await chrome.storage.sync.get('blockedPatterns');
    textarea.value = blockedPatterns.join('\n');
    renderPreview(blockedPatterns);
  } catch (err) {
    console.error('[SimpleBlocker] Failed to load patterns from storage', err);
    if (statusEl) {
      statusEl.textContent = 'Error loading saved patterns.';
      statusEl.className = 'status error';
    }
  }

  // Update preview live as user types
  textarea.addEventListener('input', () => {
    const patterns = getPatternsFromTextarea(textarea.value);
    renderPreview(patterns);

    if (statusEl) {
      statusEl.textContent = '';
      statusEl.className = 'status';
    }
  });

  // Save button → ONLY writes to storage.
  // Background script listens to storage changes and rebuilds DNR rules.
  saveBtn.addEventListener('click', async () => {
    const patterns = getPatternsFromTextarea(textarea.value);

    try {
      await chrome.storage.sync.set({ blockedPatterns: patterns });
      if (statusEl) {
        statusEl.textContent = 'Saved and blocking list updated ✓';
        statusEl.className = 'status ok';
      }
    } catch (err) {
      console.error('[SimpleBlocker] Failed to save patterns', err);
      if (statusEl) {
        statusEl.textContent = 'Error saving patterns.';
        statusEl.className = 'status error';
      }
    }
  });

  // Examples collapsible
  if (examplesToggle && examplesBody) {
    examplesToggle.addEventListener('click', () => {
      const isOpen = examplesBody.classList.toggle('open');
      examplesToggle.classList.toggle('open', isOpen);
    });
  }

  // Help dialog
  if (helpIcon && helpDialog && helpClose) {
    helpIcon.addEventListener('click', () => {
      if (typeof helpDialog.showModal === 'function') {
        helpDialog.showModal();
      }
    });

    helpClose.addEventListener('click', () => {
      helpDialog.close();
    });
  }
});
