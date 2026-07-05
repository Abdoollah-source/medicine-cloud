import { loadTemplate, getActiveTemplate, loadRegistry, TEMPLATES } from './templates.js';
import { renderNote } from './renderer.js';
import { createNote, getNote, updateNote } from './notes.js';

let currentValidNote = null;
let isUpdateMode = false;
let noteId = null;
let debounceTimer = null;

function validateSchema(parsed) {
  if (!parsed || typeof parsed !== 'object') return 'Invalid JSON structure.';
  if (!parsed.title || typeof parsed.title !== 'string' || !parsed.title.trim()) return 'Missing required field: title';
  if (!parsed.lang || !['en', 'ar'].includes(parsed.lang)) return 'Missing required field: lang (must be "en" or "ar")';
  if (parsed.content === undefined || parsed.content === null) return 'Missing required field: content';
  return null;
}

function buildPayload(parsed, templateId) {
  const payload = {
    title: parsed.title,
    lang: parsed.lang,
    content: parsed.content
  };
  if (parsed.subject) payload.subject = parsed.subject;
  if (parsed.unit) payload.unit = parsed.unit;
  if (parsed.date) payload.date = parsed.date;
  if (parsed.alt) payload.alt = parsed.alt;
  payload.template_id = templateId || 'classic';
  return payload;
}

function updateSaveButtonState() {
  const btn = document.getElementById('saveBtn');
  if (!btn) return;
  const disabled = currentValidNote === null;
  btn.disabled = disabled;
  btn.setAttribute('aria-disabled', String(disabled));
}

function detectMode() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (id) {
    isUpdateMode = true;
    noteId = id;
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = 'Edit Note';
    return true;
  }
  isUpdateMode = false;
  noteId = null;
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) pageTitle.textContent = 'New Note';
  return false;
}

async function loadNoteForEdit(id) {
  const { data, error } = await getNote(id);
  if (error || !data) {
    const el = document.getElementById('note-content');
    if (el) el.innerHTML = '<div class="error-box"><strong>Note not found or you do not have access.</strong><p>The note may have been deleted or the ID is invalid.</p></div>';
    const statusBar = document.getElementById('statusBar');
    if (statusBar) {
      statusBar.className = 'error-state';
      statusBar.textContent = 'Note not found.';
    }
    return;
  }

  const draft = {
    title: data.title,
    lang: data.lang,
    content: data.content
  };
  if (data.subject) draft.subject = data.subject;
  if (data.unit) draft.unit = data.unit;
  if (data.date) draft.date = data.date;
  if (data.alt) draft.alt = data.alt;
  if (data.template_id) draft.template_id = data.template_id;

  const textarea = document.getElementById('jsonInput');
  if (textarea) {
    textarea.value = JSON.stringify(draft, null, 2);
  }

  const templateSelect = document.getElementById('templateSelect');
  if (templateSelect && data.template_id && TEMPLATES[data.template_id]) {
    templateSelect.value = data.template_id;
  }

  onJsonChange(true);
}

function onJsonChange(skipDebounce) {
  const textarea = document.getElementById('jsonInput');
  const statusBar = document.getElementById('statusBar');
  if (!textarea || !statusBar) return;

  if (skipDebounce) {
    processInput(textarea, statusBar);
    return;
  }

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    processInput(textarea, statusBar);
  }, 300);
}

function processInput(textarea, statusBar) {
  const raw = textarea.value.trim();
  const previewContainer = document.getElementById('preview-container');

  if (!raw) {
    currentValidNote = null;
    statusBar.className = '';
    statusBar.textContent = 'Paste note JSON to preview...';
    if (previewContainer) {
      const titleEl = previewContainer.querySelector('#note-title');
      const metaBar = previewContainer.querySelector('#note-meta-bar');
      const contentEl = previewContainer.querySelector('#note-content');
      if (titleEl) titleEl.textContent = '';
      if (metaBar) metaBar.innerHTML = '';
      if (contentEl) contentEl.innerHTML = '';
    }
    updateSaveButtonState();
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    currentValidNote = null;
    statusBar.className = 'error-state';
    statusBar.textContent = e.message;
    updateSaveButtonState();
    return;
  }

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      currentValidNote = null;
      statusBar.className = 'error-state';
      statusBar.textContent = 'Note must be a JSON object, not an empty array.';
      updateSaveButtonState();
      return;
    }
    if (parsed.length > 1) {
      currentValidNote = null;
      statusBar.className = 'error-state';
      statusBar.textContent = 'Note must be a single JSON object, not an array of ' + parsed.length + ' items.';
      updateSaveButtonState();
      return;
    }
    parsed = parsed[0];
  }

  const schemaError = validateSchema(parsed);
  if (schemaError) {
    currentValidNote = null;
    statusBar.className = 'error-state';
    statusBar.textContent = schemaError;
    updateSaveButtonState();
    return;
  }

  currentValidNote = parsed;
  statusBar.className = 'success-state';
  statusBar.textContent = 'Valid JSON';
  updateSaveButtonState();

  if (previewContainer) {
    try {
      renderNote(parsed, previewContainer);
    } catch (e) {
      statusBar.className = 'error-state';
      statusBar.textContent = 'Render error: ' + e.message;
    }
  }
}

async function handleSave() {
  if (!currentValidNote) return;

  const btn = document.getElementById('saveBtn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Saving...';
  }

  try {
    const templateSelect = document.getElementById('templateSelect');
    const templateId = templateSelect ? templateSelect.value : 'classic';
    const payload = buildPayload(currentValidNote, templateId);

    if (isUpdateMode && noteId) {
      const { data, error } = await updateNote(noteId, payload);
      if (error) throw error;
      window.location.href = 'note.html?id=' + noteId;
    } else {
      const { data, error } = await createNote(payload);
      if (error) throw error;
      window.location.href = 'note.html?id=' + data.id;
    }
  } catch (e) {
    const statusBar = document.getElementById('statusBar');
    if (statusBar) {
      statusBar.className = 'error-state';
      statusBar.textContent = 'Save failed: ' + e.message;
    }
    if (btn) {
      btn.disabled = false;
      btn.textContent = isUpdateMode ? 'Update Note' : 'Save Note';
    }
  }
}

function handleClear() {
  const textarea = document.getElementById('jsonInput');
  if (!textarea) return;
  if (textarea.value.trim() && !confirm('Clear all content? This cannot be undone.')) return;

  textarea.value = '';
  currentValidNote = null;

  const previewContainer = document.getElementById('preview-container');
  if (previewContainer) {
    const titleEl = previewContainer.querySelector('#note-title');
    const metaBar = previewContainer.querySelector('#note-meta-bar');
    const contentEl = previewContainer.querySelector('#note-content');
    if (titleEl) titleEl.textContent = '';
    if (metaBar) metaBar.innerHTML = '';
    if (contentEl) contentEl.innerHTML = '';
  }

  const statusBar = document.getElementById('statusBar');
  if (statusBar) {
    statusBar.className = '';
    statusBar.textContent = 'Paste note JSON to preview...';
  }

  updateSaveButtonState();
}

function initTemplateSelector() {
  const select = document.getElementById('templateSelect');
  if (!select) return;

  loadRegistry().then(templates => {
    select.innerHTML = '';
    templates.forEach(tpl => {
      const opt = document.createElement('option');
      opt.value = tpl.id;
      opt.textContent = tpl.name;
      select.appendChild(opt);
    });

    select.value = getActiveTemplate();
    loadTemplate(select.value);
  });

  select.addEventListener('change', () => {
    loadTemplate(select.value);
    if (currentValidNote) {
      const previewContainer = document.getElementById('preview-container');
      if (previewContainer) {
        try {
          renderNote(currentValidNote, previewContainer);
        } catch (e) {
          const statusBar = document.getElementById('statusBar');
          if (statusBar) {
            statusBar.className = 'error-state';
            statusBar.textContent = 'Render error: ' + e.message;
          }
        }
      }
    }
  });
}

function initEditor() {
  detectMode();

  const textarea = document.getElementById('jsonInput');
  if (textarea) {
    textarea.addEventListener('input', () => onJsonChange(false));
  }

  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', handleSave);
    if (isUpdateMode) {
      saveBtn.textContent = 'Update Note';
    }
  }

  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', handleClear);
  }

  initTemplateSelector();
  updateSaveButtonState();

  if (isUpdateMode && noteId) {
    loadNoteForEdit(noteId);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEditor);
} else {
  initEditor();
}

export { initEditor, validateSchema, buildPayload };
