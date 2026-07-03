// Template registry — loaded from src/templates/registry.json
// CSS templates: swap the stylesheet on the live viewer
// HTML templates: used for HTML export only (full standalone documents)

let _registry = null;

async function loadRegistry() {
  if (_registry) return _registry;
  try {
    const res = await fetch(new URL('../templates/registry.json', location.href).href);
    if (!res.ok) throw new Error('registry.json not found');
    _registry = await res.json();
  } catch (e) {
    console.warn('Could not load template registry, using defaults:', e);
    _registry = [
      { id: 'classic', name: 'Classic', type: 'css', description: '' },
      { id: 'academic-dark', name: 'Academic Dark', type: 'css', description: '' }
    ];
  }
  return _registry;
}

// CSS templates only (used by the live viewer)
const CSS_TEMPLATES = {
  classic: '../css/templates/classic.css',
  'academic-dark': '../css/templates/academic-dark.css'
};

// Legacy export kept for backward compatibility
const TEMPLATES = CSS_TEMPLATES;

function loadTemplate(templateId) {
  // HTML templates don't change the viewer — just save preference
  if (!CSS_TEMPLATES[templateId]) {
    try { localStorage.setItem('mc-template', templateId); } catch (e) {}
    return;
  }

  const existing = document.getElementById('mc-template-link');
  if (existing) existing.remove();

  const link = document.createElement('link');
  link.id = 'mc-template-link';
  link.rel = 'stylesheet';
  link.href = CSS_TEMPLATES[templateId];
  document.head.appendChild(link);

  try { localStorage.setItem('mc-template', templateId); } catch (e) {}
}

function getActiveTemplate() {
  try {
    const saved = localStorage.getItem('mc-template');
    if (saved) return saved;
  } catch (e) {}
  return 'classic';
}

export { loadTemplate, getActiveTemplate, loadRegistry, TEMPLATES };
