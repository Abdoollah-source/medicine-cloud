function makeSlug(title) {
  return (title || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
    || 'note';
}

function makeFilename(slug) {
  const date = new Date().toISOString().slice(0, 10);
  return 'medicine-cloud-' + slug + '-' + date + '.html';
}

async function fetchCss(templateId) {
  const base = new URL('../css/', location.href).href;
  const baseUrl = base + 'base.css';
  const templateUrl = base + 'templates/' + templateId + '.css';

  const [baseRes, templateRes] = await Promise.all([
    fetch(baseUrl),
    fetch(templateUrl)
  ]);

  if (!baseRes.ok) throw new Error('Failed to load base stylesheet (' + baseRes.status + ')');
  if (!templateRes.ok) throw new Error('Failed to load template stylesheet (' + templateRes.status + ')');

  const baseCss = await baseRes.text();
  const templateCss = await templateRes.text();
  return { baseCss, templateCss };
}

function buildExportableNote(note) {
  const out = {
    title: note.title,
    lang: note.lang,
    content: note.content
  };
  if (note.alt) out.alt = note.alt;
  if (note.subject) out.subject = note.subject;
  if (note.unit) out.unit = note.unit;
  if (note.date) out.date = note.date;
  out.template_id = note.template_id || 'classic';
  return out;
}

var RENDERER_IIFE = `
(function(){
function sanitiseContent(htmlContent) {
  var ALLOWED_TAGS = new Set(['P','H2','H3','UL','OL','LI','STRONG','EM','TABLE','TR','TH','TD','SUP','SUB','A']);
  var TERM_CLASSES = new Set(['term-microbe','term-protein','term-pathology','term-anatomy','term-pharma']);
  var parser = new DOMParser();
  var doc = parser.parseFromString('<div id="sanitise-wrap">'+htmlContent+'</div>','text/html');
  var wrap = doc.getElementById('sanitise-wrap');
  function walk(node) {
    if (node.nodeType === 3) return;
    if (node.nodeType !== 1) return;
    var tag = node.tagName;
    if (!ALLOWED_TAGS.has(tag)) {
      var text = node.textContent || '';
      var textNode = doc.createTextNode(text);
      node.parentNode.replaceChild(textNode, node);
      return;
    }
    Array.from(node.childNodes).forEach(walk);
    var attrsToRemove = [];
    Array.from(node.attributes).forEach(function(attr) {
      if (tag === 'A') {
        if (attr.name === 'href') {
          if (!attr.value.startsWith('https://en.wikipedia.org/wiki/')) attrsToRemove.push(attr);
        } else if (attr.name === 'class') {
          if (!TERM_CLASSES.has(attr.value)) attrsToRemove.push(attr);
        } else if (attr.name === 'target') {
          if (attr.value !== '_blank') attrsToRemove.push(attr);
        } else if (attr.name === 'rel') {
          if (attr.value !== 'noopener noreferrer') attrsToRemove.push(attr);
        } else { attrsToRemove.push(attr); }
      } else { attrsToRemove.push(attr); }
    });
    attrsToRemove.forEach(function(a) { node.removeAttribute(a.name); });
  }
  Array.from(wrap.childNodes).forEach(walk);
  return wrap.innerHTML;
}
function escapeHtml(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
function processMediaTags(content) {
  content = content.replace(/\\[\\[YT:([^\\]|]+)(?:\\|([^\\]]+))?\\]\\]/g, function(match, videoId, caption) {
    var id = videoId.trim();
    var cap = caption ? '<div class="media-caption">'+escapeHtml(caption.trim())+'</div>' : '';
    return '<div class="media-embed yt-embed">'+cap+'<div class="iframe-container"><iframe src="https://www.youtube-nocookie.com/embed/'+id+'" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy" title="YouTube video"></iframe></div><a href="https://www.youtube.com/watch?v='+id+'" target="_blank" rel="noopener noreferrer" class="media-btn btn-yt"><span>Watch on YouTube</span></a></div>';
  });
  content = content.replace(/\\[\\[TG_POST:([^\\]|]+)(?:\\|([^\\]]+))?\\]\\]/g, function(match, postPath, caption) {
    var path = postPath.trim();
    var cap = caption ? '<div class="media-caption">'+escapeHtml(caption.trim())+'</div>' : '';
    return '<div class="media-embed tg-embed">'+cap+'<div class="iframe-container tg-post-container"><iframe src="https://t.me/'+path+'?embed=1" scrolling="no" loading="lazy" title="Telegram post"></iframe></div><a href="https://t.me/'+path+'" target="_blank" rel="noopener noreferrer" class="media-btn btn-tg"><span>View on Telegram</span></a></div>';
  });
  content = content.replace(/\\[\\[TG_AUDIO:([^\\]|]+)(?:\\|([^\\]]+))?\\]\\]/g, function(match, url, caption) {
    var rawUrl = url.trim();
    var cap = caption ? '<div class="media-caption">'+escapeHtml(caption.trim())+'</div>' : '';
    return '<div class="media-card tg-audio-card">'+cap+'<div class="card-text"><span class="card-title">Voice Message / Audio Clip</span><span class="card-desc">Audio files from Telegram cannot be embedded directly. Open the original on Telegram to listen.</span></div><a href="'+rawUrl+'" target="_blank" rel="noopener noreferrer" class="media-btn btn-tg"><span>Listen on Telegram</span></a></div>';
  });
  content = content.replace(/\\[\\[AUDIO:([^\\]|]+)(?:\\|([^\\]]+))?\\]\\]/g, function(match, url, caption) {
    var rawUrl = url.trim();
    var cap = caption ? '<div class="media-caption">'+escapeHtml(caption.trim())+'</div>' : '';
    return '<div class="media-embed">'+cap+'<audio controls preload="none" src="'+rawUrl+'"></audio></div>';
  });
  content = content.replace(/\\[\\[TG_IMAGE:([^\\]|]+)(?:\\|([^\\]]+))?\\]\\]/g, function(match, url, caption) {
    var rawUrl = url.trim();
    var cap = caption ? '<div class="media-caption">'+escapeHtml(caption.trim())+'</div>' : '';
    return '<div class="media-card tg-image-card">'+cap+'<div class="card-text"><span class="card-title">Telegram Hosted Image</span><span class="card-desc">Direct loading may require authentication. View the full resolution original via the button below.</span></div><a href="'+rawUrl+'" target="_blank" rel="noopener noreferrer" class="media-btn btn-tg"><span>View Image on Telegram</span></a></div>';
  });
  content = content.replace(/\\[\\[IMAGE:([^\\]|]+)(?:\\|([^\\]]+))?\\]\\]/g, function(match, url, caption) {
    var rawUrl = url.trim();
    var cap = caption ? '<figcaption>'+escapeHtml(caption.trim())+'</figcaption>' : '';
    return '<figure class="media-image"><img src="'+rawUrl+'" alt="'+(caption ? escapeHtml(caption.trim()) : 'Embedded image')+'" loading="lazy" />'+cap+'</figure>';
  });
  content = content.replace(/\\[\\[VIDEO:([^\\]|]+)(?:\\|([^\\]]+))?\\]\\]/g, function(match, url, caption) {
    var rawUrl = url.trim();
    var cap = caption ? '<div class="media-caption">'+escapeHtml(caption.trim())+'</div>' : '';
    return '<div class="media-embed">'+cap+'<div class="iframe-container"><video controls preload="none" src="'+rawUrl+'" style="width:100%;height:100%;background:#000;"></video></div></div>';
  });
  return content;
}
function renderNote(note, containerEl) {
  if (!note || note.content === undefined || note.content === null) {
    containerEl.innerHTML = '<div class="error-box"><strong>Note could not be rendered.</strong><p>The note data is missing or incomplete.</p></div>';
    return;
  }
  var lang = note.lang === 'ar' ? 'ar' : 'en';
  var isRTL = lang === 'ar';
  document.documentElement.lang = lang;
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.title = note.title || 'Note';
  var titleEl = containerEl.querySelector('#note-title');
  var metaBar = containerEl.querySelector('#note-meta-bar');
  var contentEl = containerEl.querySelector('#note-content');
  if (titleEl) { titleEl.textContent = note.title || 'Untitled Note'; titleEl.dir = isRTL ? 'rtl' : 'ltr'; }
  if (metaBar) {
    metaBar.innerHTML = '';
    var fields = [note.subject, note.unit, note.date].filter(Boolean);
    fields.forEach(function(text) {
      var pill = document.createElement('span');
      pill.className = 'note-pill';
      pill.textContent = text;
      metaBar.appendChild(pill);
    });
  }
  var htmlContent = note.content || '';
  htmlContent = sanitiseContent(htmlContent);
  htmlContent = processMediaTags(htmlContent);
  if (contentEl) { contentEl.innerHTML = htmlContent; contentEl.dir = isRTL ? 'rtl' : 'ltr'; }
}
window.MC = window.MC || {};
window.MC.renderNote = renderNote;
window.MC.sanitiseContent = sanitiseContent;
window.MC.processMediaTags = processMediaTags;
window.MC.escapeHtml = escapeHtml;
})();
`;

var HYDRATION_IIFE = `
(function(){
var noteData = JSON.parse(document.getElementById('note-data').textContent.trim());
var noteContainer = document.querySelector('.note-container');
var showingAlt = false;
function prefersDark() { return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; }
function applyTheme(t) { document.documentElement.setAttribute('data-theme', t); try { localStorage.setItem('mc-theme', t); } catch(e){} }
var savedTheme = null; try { savedTheme = localStorage.getItem('mc-theme'); } catch(e){}
applyTheme(savedTheme || (prefersDark() ? 'dark' : 'light'));
var themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', function() {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
}
var langToggle = document.getElementById('langToggle');
var langLabel = document.getElementById('langToggleLabel');
if (noteData.alt && noteData.alt.content) {
  if (langToggle) langToggle.style.display = '';
  if (langLabel) langLabel.textContent = noteData.lang === 'ar' ? 'EN' : 'AR';
  if (langToggle) {
    langToggle.addEventListener('click', function() {
      showingAlt = !showingAlt;
      var target = showingAlt ? noteData.alt : noteData;
      window.MC.renderNote(target, noteContainer);
      if (langLabel) langLabel.textContent = showingAlt ? (noteData.lang === 'ar' ? 'AR' : 'EN') : (noteData.lang === 'ar' ? 'EN' : 'AR');
    });
  }
} else {
  if (langToggle) langToggle.style.display = 'none';
}
window.MC.renderNote(noteData, noteContainer);
})();
`;

function buildDocument(exportNote, baseCss, templateCss, templateId) {
  var lang = exportNote.lang === 'ar' ? 'ar' : 'en';
  var dir = lang === 'ar' ? 'rtl' : 'ltr';
  var title = (exportNote.title || 'Note').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  var description = title + ' — Medicine Cloud study note';

  return '<!DOCTYPE html>\n<html lang="' + lang + '" dir="' + dir + '">\n<head>\n'
    + '<meta charset="UTF-8">\n'
    + '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '<title>' + title + ' — Medicine Cloud</title>\n'
    + '<meta name="description" content="' + description + '">\n'
    + '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    + '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    + '<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;1,7..72,400&family=Quicksand:wght@400;500;600;700&family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet">\n'
    + '<style>\n/* === base.css === */\n' + baseCss + '\n/* === ' + templateId + '.css === */\n' + templateCss + '\n</style>\n'
    + '</head>\n<body>\n'
    + '<div class="grain" aria-hidden="true"></div>\n'
    + '<div class="corner tl" aria-hidden="true"></div>\n'
    + '<div class="corner tr" aria-hidden="true"></div>\n'
    + '<div class="corner bl" aria-hidden="true"></div>\n'
    + '<div class="corner br" aria-hidden="true"></div>\n'
    + '<div class="plate">\n'
    + '  <div class="top-row">\n'
    + '    <span class="brand-eyebrow">Medicine <b>Cloud</b></span>\n'
    + '    <div class="top-controls">\n'
    + '      <select class="template-switcher" aria-label="Select visual template" style="display:none">\n'
    + '        <option value="classic">Classic</option>\n'
    + '        <option value="academic-dark">Academic Dark</option>\n'
    + '      </select>\n'
    + '      <button class="lang-toggle" id="langToggle" type="button" aria-label="Toggle language">\n'
    + '        <span id="langToggleLabel">EN</span>\n'
    + '      </button>\n'
    + '      <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle light and dark theme">\n'
    + '        <span class="toggle-icon">\n'
    + '          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/></svg>\n'
    + '          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/></svg>\n'
    + '        </span>\n'
    + '        <span>Theme</span>\n'
    + '      </button>\n'
    + '    </div>\n'
    + '  </div>\n'
    + '  <div class="main-block">\n'
    + '    <div class="rule-top" aria-hidden="true"></div>\n'
    + '    <div class="identity">\n'
    + '      <button class="seal-btn" id="logoBtn" type="button" aria-label="Open channel on Telegram">\n'
    + '        <img src="https://i.ibb.co/Xxf7XStF/logo.png" alt="Logo" />\n'
    + '      </button>\n'
    + '      <div class="name-block">\n'
    + '        <a class="name-link" id="nameLink" href="https://t.me/Murtadha_Basem" target="_blank" rel="noopener noreferrer" aria-label="Message on Telegram">\n'
    + '          <h1 class="name-text">Murtadha<br><em>Basem</em></h1>\n'
    + '          <span class="name-rule" aria-hidden="true"></span>\n'
    + '        </a>\n'
    + '        <p class="role-line">Founder, Medicine Cloud — Lecture Journals &amp; Clinical Notes</p>\n'
    + '      </div>\n'
    + '    </div>\n'
    + '    <div class="ekg-rule" aria-hidden="true">\n'
    + '      <svg viewBox="0 0 1000 28" preserveAspectRatio="none">\n'
    + '        <path class="ekg-line" d="M0 14 H400 L424 14 L440 3 L456 25 L470 9 L484 14 H1000" />\n'
    + '        <circle class="ekg-dot" cx="484" cy="14" r="3.2" />\n'
    + '      </svg>\n'
    + '    </div>\n'
    + '    <article class="note-container">\n'
    + '      <h1 class="note-title" id="note-title">Loading Note...</h1>\n'
    + '      <div class="note-meta-bar" id="note-meta-bar"></div>\n'
    + '      <div class="note-content" id="note-content"></div>\n'
    + '    </article>\n'
    + '    <div class="channel-row">\n'
    + '      <div>\n'
    + '        <p class="channel-label">Stay current</p>\n'
    + '        <a class="channel-link" id="channelLink" href="https://t.me/Medicine_Cloud" target="_blank" rel="noopener noreferrer" aria-label="Open Medicine Cloud Telegram channel">\n'
    + '          <span class="channel-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.7 4.5 18.9 19c-.2 1-.8 1.2-1.6.8l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.8.4l.3-4.1L18 7.6c.3-.3-.1-.4-.4-.2L8 13.7l-4-1.2c-.9-.3-.9-.9.2-1.3L20.3 3.6c.7-.3 1.4.2 1.4.9Z"/></svg></span>\n'
    + '          <span class="channel-copy"><span class="channel-name">Medicine Cloud</span><span class="channel-handle">t.me/Medicine_Cloud</span></span>\n'
    + '        </a>\n'
    + '      </div>\n'
    + '      <span class="channel-cta">\n'
    + '        Join the channel\n'
    + '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>\n'
    + '      </span>\n'
    + '    </div>\n'
    + '  </div>\n'
    + '  <div class="bottom-row">\n'
    + '    <span class="meta">Academic Session 2025 — 2026</span>\n'
    + '    <span class="meta">Confidential / Academic</span>\n'
    + '  </div>\n'
    + '</div>\n'
    + '<script id="note-data" type="application/json">\n' + JSON.stringify(exportNote, null, 2) + '\n</script>\n'
    + '<script>' + RENDERER_IIFE + '</script>\n'
    + '<script>' + HYDRATION_IIFE + '</script>\n'
    + '</body>\n</html>';
}

function triggerDownload(htmlString, filename) {
  var blob = new Blob([htmlString], { type: 'text/html; charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function() { URL.revokeObjectURL(url); }, 10000);
}

async function exportHTML(note, templateId) {
  var exportNote = buildExportableNote(note);
  var slug = makeSlug(exportNote.title);
  var filename = makeFilename(slug);

  var css = await fetchCss(templateId);
  var html = buildDocument(exportNote, css.baseCss, css.templateCss, templateId);
  triggerDownload(html, filename);
}

export { exportHTML };
