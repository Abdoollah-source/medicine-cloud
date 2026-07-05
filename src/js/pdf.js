import { enableSharing } from './notes.js';

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

function buildFilename(note) {
  var slug = makeSlug(note && note.title);
  var date = new Date().toISOString().slice(0, 10);
  return 'medicine-cloud-' + slug + '-' + date;
}

// Zero-cost fallback: browser's native print-to-PDF. Always works, no
// network dependency. Used whenever the Worker path isn't available or fails.
function printExport(note) {
  var suggestedFilename = buildFilename(note);
  var originalTitle = document.title;
  document.title = suggestedFilename;

  function restoreTitle() {
    document.title = originalTitle;
    window.removeEventListener('afterprint', restoreTitle);
  }
  window.addEventListener('afterprint', restoreTitle);
  window.print();
  setTimeout(restoreTitle, 2000);
}

// One-click path via the Cloudflare Worker (headless Chromium). Returns
// true on success, false on any failure so the caller can fall back.
// Never throws.
async function tryWorkerExport(note, templateId) {
  try {
    var workerUrl = window.CLOUDFLARE_WORKER_URL;
    if (!workerUrl || workerUrl.indexOf('__') === 0) return false;
    if (!note || !note.id) return false;

    var shareResult = await enableSharing(note.id);
    if (shareResult.error || !shareResult.data || !shareResult.data.share_token) {
      return false;
    }

    var shareToken = shareResult.data.share_token;
    var publicUrl = location.origin + '/pages/note.html?token=' + shareToken +
      '&template=' + (templateId || 'classic');

    var response = await fetch(workerUrl + '?url=' + encodeURIComponent(publicUrl));
    if (!response.ok) return false;

    var blob = await response.blob();
    var filename = buildFilename(note) + '.pdf';

    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    return true;
  } catch (e) {
    console.warn('Worker PDF export failed, will fall back to print:', e);
    return false;
  }
}

async function requestPDFExport(note, templateId) {
  var workerSucceeded = await tryWorkerExport(note, templateId);
  if (!workerSucceeded) {
    printExport(note);
  }
}

export { requestPDFExport };
