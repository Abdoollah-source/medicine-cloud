function sanitiseContent(htmlContent) {
  const ALLOWED_TAGS = new Set(['P', 'H2', 'H3', 'UL', 'OL', 'LI', 'STRONG', 'EM', 'TABLE', 'TR', 'TH', 'TD', 'SUP', 'SUB', 'A']);
  const TERM_CLASSES = new Set(['term-microbe', 'term-protein', 'term-pathology', 'term-anatomy', 'term-pharma']);

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="sanitise-wrap">${htmlContent}</div>`, 'text/html');
  const wrap = doc.getElementById('sanitise-wrap');

  function walk(node) {
    if (node.nodeType === 3) return;
    if (node.nodeType !== 1) return;

    const tag = node.tagName;

    if (!ALLOWED_TAGS.has(tag)) {
      const text = node.textContent || '';
      const textNode = doc.createTextNode(text);
      node.parentNode.replaceChild(textNode, node);
      return;
    }

    Array.from(node.childNodes).forEach(walk);

    const attrsToRemove = [];
    Array.from(node.attributes).forEach(attr => {
      if (tag === 'A') {
        if (attr.name === 'href') {
          if (!attr.value.startsWith('https://en.wikipedia.org/wiki/')) {
            attrsToRemove.push(attr);
          }
        } else if (attr.name === 'class') {
          if (!TERM_CLASSES.has(attr.value)) {
            attrsToRemove.push(attr);
          }
        } else if (attr.name === 'target') {
          if (attr.value !== '_blank') {
            attrsToRemove.push(attr);
          }
        } else if (attr.name === 'rel') {
          if (attr.value !== 'noopener noreferrer') {
            attrsToRemove.push(attr);
          }
        } else {
          attrsToRemove.push(attr);
        }
      } else {
        attrsToRemove.push(attr);
      }
    });

    attrsToRemove.forEach(attr => node.removeAttribute(attr.name));
  }

  Array.from(wrap.childNodes).forEach(walk);
  return wrap.innerHTML;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function processMediaTags(content) {
  content = content.replace(/\[\[YT:([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, videoId, caption) => {
    const id = videoId.trim();
    const cap = caption ? `<div class="media-caption">${escapeHtml(caption.trim())}</div>` : '';
    return `<div class="media-embed yt-embed">${cap}
      <div class="iframe-container">
        <iframe src="https://www.youtube-nocookie.com/embed/${id}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy" title="YouTube video"></iframe>
      </div>
      <a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener noreferrer" class="media-btn btn-yt">
        <span>Watch on YouTube</span>
      </a>
    </div>`;
  });

  content = content.replace(/\[\[TG_POST:([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, postPath, caption) => {
    const path = postPath.trim();
    const cap = caption ? `<div class="media-caption">${escapeHtml(caption.trim())}</div>` : '';
    return `<div class="media-embed tg-embed">${cap}
      <div class="iframe-container tg-post-container">
        <iframe src="https://t.me/${path}?embed=1" scrolling="no" loading="lazy" title="Telegram post"></iframe>
      </div>
      <a href="https://t.me/${path}" target="_blank" rel="noopener noreferrer" class="media-btn btn-tg">
        <span>View on Telegram</span>
      </a>
    </div>`;
  });

  content = content.replace(/\[\[TG_AUDIO:([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, url, caption) => {
    const rawUrl = url.trim();
    const cap = caption ? `<div class="media-caption">${escapeHtml(caption.trim())}</div>` : '';
    return `<div class="media-card tg-audio-card">${cap}
      <div class="card-text">
        <span class="card-title">Voice Message / Audio Clip</span>
        <span class="card-desc">Audio files from Telegram cannot be embedded directly. Open the original on Telegram to listen.</span>
      </div>
      <a href="${rawUrl}" target="_blank" rel="noopener noreferrer" class="media-btn btn-tg">
        <span>Listen on Telegram</span>
      </a>
    </div>`;
  });

  content = content.replace(/\[\[AUDIO:([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, url, caption) => {
    const rawUrl = url.trim();
    const cap = caption ? `<div class="media-caption">${escapeHtml(caption.trim())}</div>` : '';
    return `<div class="media-embed">${cap}
      <audio controls preload="none" src="${rawUrl}"></audio>
    </div>`;
  });

  content = content.replace(/\[\[TG_IMAGE:([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, url, caption) => {
    const rawUrl = url.trim();
    const cap = caption ? `<div class="media-caption">${escapeHtml(caption.trim())}</div>` : '';
    return `<div class="media-card tg-image-card">${cap}
      <div class="card-text">
        <span class="card-title">Telegram Hosted Image</span>
        <span class="card-desc">Direct loading may require authentication. View the full resolution original via the button below.</span>
      </div>
      <a href="${rawUrl}" target="_blank" rel="noopener noreferrer" class="media-btn btn-tg">
        <span>View Image on Telegram</span>
      </a>
    </div>`;
  });

  content = content.replace(/\[\[IMAGE:([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, url, caption) => {
    const rawUrl = url.trim();
    const cap = caption ? `<figcaption>${escapeHtml(caption.trim())}</figcaption>` : '';
    return `<figure class="media-image">
      <img src="${rawUrl}" alt="${caption ? escapeHtml(caption.trim()) : 'Embedded image'}" loading="lazy" />
      ${cap}
    </figure>`;
  });

  content = content.replace(/\[\[VIDEO:([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, url, caption) => {
    const rawUrl = url.trim();
    const cap = caption ? `<div class="media-caption">${escapeHtml(caption.trim())}</div>` : '';
    return `<div class="media-embed">${cap}
      <div class="iframe-container">
        <video controls preload="none" src="${rawUrl}" style="width:100%;height:100%;background:#000;"></video>
      </div>
    </div>`;
  });

  return content;
}

function renderNote(note, containerEl) {
  if (!note || note.content === undefined || note.content === null) {
    containerEl.innerHTML = '<div class="error-box"><strong>Note could not be rendered.</strong><p>The note data is missing or incomplete. Please reload the page or contact support.</p></div>';
    return;
  }

  const lang = note.lang === 'ar' ? 'ar' : 'en';
  const isRTL = lang === 'ar';

  document.documentElement.lang = lang;
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.title = note.title || 'Note';

  const titleEl = containerEl.querySelector('#note-title');
  const metaBar = containerEl.querySelector('#note-meta-bar');
  const contentEl = containerEl.querySelector('#note-content');

  if (titleEl) {
    titleEl.textContent = note.title || 'Untitled Note';
    titleEl.dir = isRTL ? 'rtl' : 'ltr';
  }

  if (metaBar) {
    metaBar.innerHTML = '';
    const fields = [note.subject, note.unit, note.date].filter(Boolean);
    fields.forEach(text => {
      const pill = document.createElement('span');
      pill.className = 'note-pill';
      pill.textContent = text;
      metaBar.appendChild(pill);
    });
  }

  let htmlContent = note.content || '';
  htmlContent = sanitiseContent(htmlContent);
  htmlContent = processMediaTags(htmlContent);

  if (contentEl) {
    contentEl.innerHTML = htmlContent;
    contentEl.dir = isRTL ? 'rtl' : 'ltr';
  }
}

export { renderNote, sanitiseContent, processMediaTags, escapeHtml };
