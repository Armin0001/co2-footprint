// Injected into the current tab with chrome.scripting, so it must be self-contained.
// Adds up everything the page downloaded, using the browser's own Performance API.
function measurePage() {
  const resources = performance.getEntriesByType('resource');

  // One entry per file: preloaded files show up twice. Cached and revalidated (304) files
  // still count at full size, i.e. what a first-time visitor downloads.
  const files = new Map();
  for (const entry of [...performance.getEntriesByType('navigation'), ...resources]) {
    const size = Math.max(entry.transferSize, entry.encodedBodySize);
    const file = files.get(entry.name);
    if (file) file.size = Math.max(file.size, size);
    else files.set(entry.name, { size, initiator: entry.initiatorType });
  }

  let bytes = 0;
  const hidden = {}; // files from other domains whose size the server keeps private, by type
  for (const [url, { size, initiator }] of files) {
    if (size > 0) {
      bytes += size;
      continue;
    }
    const { origin, pathname } = new URL(url);
    if (origin === location.origin) continue; // genuinely empty
    const ext = pathname.split('.').pop().toLowerCase();
    let type;
    if (initiator === 'script' || /^m?js$/.test(ext)) type = 'script';
    else if (ext === 'css') type = 'css';
    else if (/^(woff2?|ttf|otf)$/.test(ext)) type = 'font';
    else if (['img', 'image', 'icon'].includes(initiator) || /^(png|jpe?g|gif|webp|avif|svg|ico)$/.test(ext)) type = 'image';
    else if (initiator === 'iframe') type = 'html';
    else continue; // API calls and tracking beacons: usually tiny
    hidden[type] = (hidden[type] ?? 0) + 1;
  }

  return {
    host: location.hostname,
    bytes,
    files: files.size,
    hidden,
    truncated: resources.length >= 250, // Chrome stops recording after 250 files by default
  };
}

const $ = (id) => document.getElementById(id);

function show(id) {
  $('loading').hidden = true;
  $(id).hidden = false;
}

function showError(title, text) {
  $('error-title').textContent = title;
  $('error-text').textContent = text;
  show('error');
}

function formatGrams(grams) {
  if (grams >= 10) return grams.toFixed(1);
  if (grams >= 0.1) return grams.toFixed(2);
  return grams.toFixed(3);
}

function formatBytes(bytes) {
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1e3))} kB`;
}

function formatMass(grams) {
  if (grams >= 1000) return `${(grams / 1000).toFixed(1)} kg`;
  if (grams >= 10) return `${Math.round(grams)} g`;
  return `${grams.toFixed(1)} g`;
}

function render(page, bytes) {
  const grams = gramsCO2e(bytes);
  const { grade, cleanerThan } = rate(grams);

  $('host').textContent = page.host;
  $('grams').textContent = formatGrams(grams);
  $('grade').textContent = grade;
  $('grade').dataset.grade = grade;
  $('grade-text').textContent = cleanerThan
    ? `Cleaner than ${cleanerThan}% of web pages`
    : 'Dirtier than half of all web pages';
  $('size').textContent = formatBytes(bytes);
  $('files').textContent = page.files.toLocaleString('en-US');
  $('per-thousand').textContent = formatMass(grams * 1000);

  const notes = [];
  const hidden = Object.values(page.hidden).reduce((sum, n) => sum + n, 0);
  if (hidden) {
    notes.push(`Uses typical sizes for ${hidden} ${hidden === 1 ? 'file' : 'files'} whose server keeps the exact size private.`);
  }
  if (page.truncated) {
    notes.push('Chrome stops counting after 250 files, so the real figure is probably higher.');
  }
  $('note').textContent = notes.join(' ');
  $('note').hidden = !notes.length;
  show('result');
}

async function main() {
  let page;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: measurePage,
    });
    page = result;
  } catch {
    showError(
      "Can't measure this page",
      "Chrome doesn't let extensions read its own pages, the Web Store or local files. Open a website and click again.",
    );
    return;
  }
  const estimated = Object.entries(page?.hidden ?? {})
    .reduce((sum, [type, count]) => sum + count * TYPICAL_BYTES[type], 0);
  const bytes = (page?.bytes ?? 0) + estimated;
  if (bytes === 0) {
    showError('Nothing to measure yet', 'Reload the page, let it finish loading, then click again.');
    return;
  }
  render(page, bytes);
}

main();
