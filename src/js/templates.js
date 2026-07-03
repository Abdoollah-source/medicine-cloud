const TEMPLATES = {
  classic: '../css/templates/classic.css',
  'academic-dark': '../css/templates/academic-dark.css'
};

function loadTemplate(templateId) {
  const path = TEMPLATES[templateId];
  if (!path) return;

  const existing = document.getElementById('mc-template-link');
  if (existing) existing.remove();

  const link = document.createElement('link');
  link.id = 'mc-template-link';
  link.rel = 'stylesheet';
  link.href = path;
  document.head.appendChild(link);

  try { localStorage.setItem('mc-template', templateId); } catch (e) {}
}

function getActiveTemplate() {
  try {
    const saved = localStorage.getItem('mc-template');
    if (saved && TEMPLATES[saved]) return saved;
  } catch (e) {}
  return 'classic';
}

export { loadTemplate, getActiveTemplate, TEMPLATES };
