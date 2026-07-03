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

async function requestPDFExport(note, templateId) {
  var workerUrl = window.CLOUDFLARE_WORKER_URL;
  if (!workerUrl || workerUrl === '__CLOUDFLARE_WORKER_URL__') {
    throw new Error('PDF worker URL is not configured.');
  }

  var shareResult = await enableSharing(note.id);
  if (shareResult.error) throw shareResult.error;
  if (!shareResult.data || !shareResult.data.share_token) {
    throw new Error('Failed to generate share token.');
  }

  var shareToken = shareResult.data.share_token;
  var publicUrl = location.origin + '/pages/note.html?token=' + shareToken + '&template=' + (templateId || 'classic');

  var response = await fetch(workerUrl + '?url=' + encodeURIComponent(publicUrl));
  if (!response.ok) {
    var errText = await response.text().catch(function() { return response.statusText; });
    throw new Error('PDF worker returned ' + response.status + ': ' + errText);
  }

  var blob = await response.blob();

  var slug = makeSlug(note.title);
  var date = new Date().toISOString().slice(0, 10);
  var filename = 'medicine-cloud-' + slug + '-' + date + '.pdf';

  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export { requestPDFExport };
