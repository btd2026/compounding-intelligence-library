/* ============================================================
   Reading Room — client logic
   - Loads data/prompts.json (built by scripts/build.js)
   - Renders the library, shelves, and cards
   - Handles modal open/close, copy, edit, download, GitHub edit
   - Local edits persist in localStorage (key: rr-edit:{id})
   ============================================================ */

const LS_PREFIX = 'rr-edit:';

const state = {
  data: null,         // full prompts.json
  prompts: [],        // array of prompts (with local overrides applied)
  config: {},
  shelfOrder: [],
  activeShelf: 'All',
  modal: null,        // { id, mode: 'read' | 'edit' } | null
};

const SHELF_COLORS = {
  Discovery: 'var(--shelf-amber)',
  Research:  'var(--shelf-blue)',
  Outreach:  'var(--shelf-teal)',
  Building:  'var(--shelf-purple)',
  Reflection:'var(--shelf-coral)',
  Misc:      'var(--shelf-gray)'
};

const ROMAN_NUMERALS = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

// -------------- ICONS (inline SVG, kept tiny) --------------
function icon(name) {
  const paths = {
    book:     '<path d="M3 4h6a3 3 0 0 1 3 3v13M21 4h-6a3 3 0 0 0-3 3v13"/><path d="M3 4v15a1 1 0 0 0 1 1h7M21 4v15a1 1 0 0 1-1 1h-7"/>',
    copy:     '<rect x="9" y="9" width="11" height="11" rx="1"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>',
    pencil:   '<path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="M14 6l4 4"/>',
    github:   '<path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5a3 3 0 0 0-.85-2.3c2.85-.3 5.85-1.4 5.85-6.3a4.8 4.8 0 0 0-1.3-3.4 4.4 4.4 0 0 0-.1-3.3s-1-.3-3.5 1.3a12 12 0 0 0-6.3 0c-2.5-1.7-3.5-1.3-3.5-1.3a4.4 4.4 0 0 0-.1 3.3 4.8 4.8 0 0 0-1.3 3.4c0 4.9 3 6 5.85 6.3a3 3 0 0 0-.85 2.3V21"/>',
    download: '<path d="M21 15v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4M7 10l5 5 5-5M12 15V3"/>',
    eye:      '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
    close:    '<path d="M18 6L6 18M6 6l18 12" transform="scale(0.85)"/>',
    save:     '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    feather:  '<path d="M20 4L8.5 15.5a4 4 0 1 0 5 5L25 9"/><path d="M16 8L2 22M17 7l-2.5 2.5"/>',
    asterisk: '<path d="M12 6v12M7.5 8.5l9 7M7.5 15.5l9-7"/>',
    flower:   '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3"/>'
  };
  const p = paths[name] || '';
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}

// -------------- INIT --------------
async function init() {
  try {
    const res = await fetch('data/prompts.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('failed to fetch data/prompts.json');
    state.data = await res.json();
    state.config = state.data.config || {};
    state.shelfOrder = state.data.shelf_order || ['Discovery','Research','Outreach','Building','Reflection'];
    state.prompts = applyLocalEdits(state.data.prompts || []);
    render();
  } catch (e) {
    document.getElementById('library').innerHTML =
      `<p class="empty">Could not load the catalog. Run <code>node scripts/build.js</code> first, then refresh.</p>`;
    console.error(e);
  }
}

// -------------- LOCAL EDITS --------------
function readLocalEdit(id) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + id);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function writeLocalEdit(id, patch) {
  localStorage.setItem(LS_PREFIX + id, JSON.stringify({ ...patch, updated_at: new Date().toISOString() }));
}

function clearLocalEdit(id) {
  localStorage.removeItem(LS_PREFIX + id);
}

function applyLocalEdits(prompts) {
  return prompts.map(p => {
    const local = readLocalEdit(p.id);
    if (!local) return { ...p, has_local: false };
    return {
      ...p,
      title: local.title ?? p.title,
      shelf: local.shelf ?? p.shelf,
      summary: local.summary ?? p.summary,
      body: local.body ?? p.body,
      has_local: true,
      local_updated_at: local.updated_at
    };
  });
}

// -------------- RENDER --------------
function render() {
  renderPlaque();
  renderFilter();
  renderShelves();
  renderColophon();
  if (state.modal) renderModal();
}

function renderPlaque() {
  const c = state.config;
  document.getElementById('plaque-title').textContent = c.collection_name || 'Your Reading Room';
  document.getElementById('plaque-subtitle').textContent = c.subtitle || 'a private library of prompts';
  document.getElementById('plaque-cohort').textContent =
    `${(c.cohort || 'Compounding Intelligence').toUpperCase()} · ${state.prompts.length} VOLUMES`;
  document.getElementById('plaque-est').textContent =
    `EST. ${c.year_roman || 'MMXXVI'} · PRIVATE COLLECTION`;
  document.title = c.collection_name || 'Reading Room';
}

function renderFilter() {
  const shelves = ['All', ...state.shelfOrder.filter(s => state.prompts.some(p => p.shelf === s))];
  // Surface any unexpected shelves not in shelf_order
  state.prompts.forEach(p => {
    if (!shelves.includes(p.shelf)) shelves.push(p.shelf);
  });
  const html = shelves.map(s => `
    <button class="filter-btn" data-shelf="${escapeAttr(s)}" aria-pressed="${s === state.activeShelf}">
      ${escapeHtml(s)}
    </button>
  `).join('');
  const filter = document.getElementById('filter');
  filter.innerHTML = html;
  filter.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeShelf = btn.dataset.shelf;
      render();
    });
  });
}

function renderShelves() {
  const library = document.getElementById('library');
  const visible = state.activeShelf === 'All'
    ? state.prompts
    : state.prompts.filter(p => p.shelf === state.activeShelf);

  if (visible.length === 0) {
    library.innerHTML = `<p class="empty">No volumes on this shelf yet. Drop a <code>.md</code> file into <code>prompts/</code> and push.</p>`;
    return;
  }

  // Group by shelf
  const byShelf = {};
  visible.forEach(p => {
    if (!byShelf[p.shelf]) byShelf[p.shelf] = [];
    byShelf[p.shelf].push(p);
  });

  // Order shelves
  const shelvesOrdered = [];
  state.shelfOrder.forEach(s => { if (byShelf[s]) shelvesOrdered.push(s); });
  Object.keys(byShelf).forEach(s => { if (!shelvesOrdered.includes(s)) shelvesOrdered.push(s); });

  const html = shelvesOrdered.map((shelfName, idx) => {
    const numeral = ROMAN_NUMERALS[idx] || String(idx + 1);
    const items = byShelf[shelfName].map(renderCardHTML).join('');
    return `
      <section class="shelf" data-shelf="${escapeAttr(shelfName)}">
        <div class="shelf-header">
          <p class="shelf-numeral">SHELF ${numeral}</p>
          <p class="shelf-name">${escapeHtml(shelfName)}</p>
          <hr class="gold-rule" />
          <span class="shelf-flower">${icon('flower')}</span>
        </div>
        <div class="shelf-grid">${items}</div>
        <hr class="plank-rule" />
        <p class="shelf-footer">— END OF SHELF ${numeral} —</p>
      </section>
    `;
  }).join('');

  library.innerHTML = html;

  // Wire card click → open in read mode
  library.querySelectorAll('.card').forEach(card => {
    const id = card.dataset.id;
    card.addEventListener('click', (e) => {
      // If user clicked a button inside the card, don't open the modal too
      if (e.target.closest('.action')) return;
      openPrompt(id, 'read');
    });
  });

  // Wire individual action buttons
  library.querySelectorAll('.card .action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const act = btn.dataset.act;
      if (act === 'open') openPrompt(id, 'read');
      else if (act === 'copy') copyPromptBody(id);
      else if (act === 'edit') openPrompt(id, 'edit');
    });
  });
}

function renderCardHTML(p) {
  const stamp = p.date_filed_roman ? `FILED ${p.date_filed_roman}` : 'UNDATED';
  const hasLocal = p.has_local ? ' has-local' : '';
  return `
    <button class="card${hasLocal}" data-id="${escapeAttr(p.id)}" type="button" aria-label="Open ${escapeAttr(p.title)}">
      <div class="card-top">
        <span class="card-call">${escapeHtml(p.call_number)}</span>
        <span class="card-stamp">${escapeHtml(stamp)}</span>
      </div>
      <p class="card-title">${escapeHtml(p.title)}</p>
      <p class="card-asterism">⁂</p>
      <p class="card-summary">${escapeHtml(p.summary || ' ')}</p>
      <hr class="card-rule" />
      <div class="card-actions">
        <span class="action solid primary" data-id="${escapeAttr(p.id)}" data-act="open">${icon('book')}<span>Open</span></span>
        <span class="action" data-id="${escapeAttr(p.id)}" data-act="copy" title="Copy prompt">${icon('copy')}</span>
        <span class="action" data-id="${escapeAttr(p.id)}" data-act="edit" title="Edit prompt">${icon('pencil')}</span>
      </div>
    </button>
  `;
}

function renderColophon() {
  const meta = state.data.generated_at
    ? `LAST SHELVED ${formatShortDate(state.data.generated_at)}`
    : '';
  document.getElementById('colophon-meta').textContent = meta;
}

// -------------- MODAL --------------
function openPrompt(id, mode) {
  state.modal = { id, mode };
  renderModal();
}

function closeModal() {
  state.modal = null;
  document.getElementById('modal').setAttribute('hidden', '');
  document.getElementById('modal-card').innerHTML = '';
  document.body.style.overflow = '';
}

function renderModal() {
  const { id, mode } = state.modal;
  const p = state.prompts.find(x => x.id === id);
  if (!p) { closeModal(); return; }

  const card = document.getElementById('modal-card');
  card.innerHTML = mode === 'edit' ? renderEditHTML(p) : renderReadHTML(p);

  document.getElementById('modal').removeAttribute('hidden');
  document.body.style.overflow = 'hidden';

  wireModal(p, mode);
}

function renderReadHTML(p) {
  const owner = state.config.owner || 'Your Name';
  const stamp = p.date_filed_roman ? `FILED ${p.date_filed_roman}` : 'UNFILED';
  const sessionLine = p.session && p.lesson
    ? `from Session ${p.session} · Lesson ${p.lesson}`
    : 'from the collection';
  // Render markdown body
  const bodyHtml = renderMarkdown(p.body);
  const editGitHubBtn = p.edit_url
    ? `<button class="action" data-act="github">${icon('github')}<span>Edit on GitHub</span></button>`
    : '';
  const localBadge = p.has_local
    ? `<span class="card-stamp" style="transform:none;">EDITED LOCALLY</span>`
    : '';
  const discardBtn = p.has_local
    ? `<button class="action danger" data-act="discard">Discard local edits</button>`
    : '';

  return `
    <div class="modal-header">
      <div>
        <p class="modal-call">CALL NO. &nbsp; ${escapeHtml(p.call_number)}</p>
        <p class="modal-collection">FROM THE COLLECTION OF ${escapeHtml(owner.toUpperCase())}</p>
      </div>
      <button class="modal-close" data-act="close" aria-label="Close">CLOSE ✕</button>
    </div>
    <div class="modal-body">
      <h2 class="modal-title" id="modal-title">${escapeHtml(p.title)}</h2>
      <p class="modal-subtitle">${escapeHtml(sessionLine)} · ${escapeHtml(p.shelf)}</p>
      <div class="ornament-rule" style="max-width:240px;"><hr class="gold-rule" /><span class="asterism">⁂</span><hr class="gold-rule" /></div>

      <div class="modal-actions">
        <button class="action solid" data-act="copy">${icon('copy')}<span>Copy prompt</span></button>
        <button class="action" data-act="edit">${icon('pencil')}<span>Edit</span></button>
        ${editGitHubBtn}
        <button class="action" data-act="download">${icon('download')}<span>Download .md</span></button>
      </div>

      <div class="modal-content" id="modal-content">${bodyHtml}</div>

      <div class="modal-foot">
        <div style="display:flex; gap:10px; align-items:center;">
          <span class="micro">⁂ ${escapeHtml(stamp)}</span>
          ${localBadge}
        </div>
        ${discardBtn}
      </div>
    </div>
  `;
}

function renderEditHTML(p) {
  // Shelf options from known order + the current value
  const shelves = Array.from(new Set([...state.shelfOrder, p.shelf, 'Discovery','Research','Outreach','Building','Reflection']));
  const shelfOptions = shelves.map(s => `<option value="${escapeAttr(s)}" ${s === p.shelf ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('');
  return `
    <div class="edit-banner">
      <div class="left">${icon('feather')}<span>EDITING &nbsp; prompts/${escapeHtml(p.filename)}</span></div>
      <span class="micro" id="autosave-stamp">⁂ NOT YET SAVED</span>
    </div>
    <div class="edit-form">
      <div class="edit-grid">
        <label for="edit-title">Title</label>
        <input id="edit-title" class="edit-input" type="text" value="${escapeAttr(p.title)}" />
        <label for="edit-shelf">Shelf</label>
        <select id="edit-shelf" class="edit-select">${shelfOptions}</select>
        <label for="edit-summary">Summary</label>
        <input id="edit-summary" class="edit-input" type="text" value="${escapeAttr(p.summary || '')}" />
      </div>
      <label for="edit-body" class="micro" style="display:block; margin-bottom:6px; text-align:left;">PROMPT BODY · MARKDOWN</label>
      <textarea id="edit-body" class="edit-textarea">${escapeHtml(p.body)}</textarea>
      <div class="edit-foot">
        <span class="micro" id="edit-status">⁂ AUTOSAVES TO YOUR BROWSER</span>
        <div class="right">
          <button class="action" data-act="preview">${icon('eye')}<span>Preview</span></button>
          <button class="action" data-act="cancel">Cancel</button>
          ${p.edit_url ? `<button class="action" data-act="github">${icon('github')}<span>Open on GitHub</span></button>` : ''}
          <button class="action" data-act="download">${icon('download')}<span>Download .md</span></button>
          <button class="action solid" data-act="save">${icon('save')}<span>Save locally</span></button>
        </div>
      </div>
    </div>
  `;
}

function wireModal(p, mode) {
  const card = document.getElementById('modal-card');

  // Close on backdrop click
  const backdrop = document.getElementById('modal');
  backdrop.onclick = (e) => { if (e.target === backdrop) closeModal(); };
  document.onkeydown = (e) => { if (e.key === 'Escape' && state.modal) closeModal(); };

  card.querySelectorAll('[data-act]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const act = el.dataset.act;
      if (act === 'close' || act === 'cancel') closeModal();
      else if (act === 'copy') copyPromptBody(p.id);
      else if (act === 'edit') openPrompt(p.id, 'edit');
      else if (act === 'github') window.open(p.edit_url, '_blank', 'noopener');
      else if (act === 'download') downloadPrompt(p.id);
      else if (act === 'preview') openPrompt(p.id, 'read');
      else if (act === 'save') saveEditFromForm(p.id);
      else if (act === 'discard') discardEdit(p.id);
    });
  });

  // Wire code-block copy buttons inside read mode
  if (mode === 'read') {
    card.querySelectorAll('.code-copy').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const pre = btn.parentElement.querySelector('pre code, pre');
        const text = (pre.innerText || pre.textContent).trim();
        copyToClipboard(text, 'Block copied');
      });
    });
  }

  // Autosave on input in edit mode
  if (mode === 'edit') {
    const title = card.querySelector('#edit-title');
    const shelf = card.querySelector('#edit-shelf');
    const summary = card.querySelector('#edit-summary');
    const body = card.querySelector('#edit-body');
    const stamp = card.querySelector('#autosave-stamp');
    let timer = null;
    const handleInput = () => {
      clearTimeout(timer);
      stamp.textContent = '⁂ SAVING…';
      timer = setTimeout(() => {
        writeLocalEdit(p.id, {
          title: title.value,
          shelf: shelf.value,
          summary: summary.value,
          body: body.value
        });
        stamp.textContent = `⁂ AUTOSAVED ${formatTime(new Date())}`;
        state.prompts = applyLocalEdits(state.data.prompts);
        renderShelves();
      }, 600);
    };
    [title, shelf, summary, body].forEach(el => {
      el.addEventListener('input', handleInput);
      el.addEventListener('change', handleInput);
    });
  }
}

// -------------- ACTIONS --------------
function copyPromptBody(id) {
  const p = state.prompts.find(x => x.id === id);
  if (!p) return;
  // Prefer the first fenced code block (usually THE prompt). Fall back to whole body.
  const codeMatch = p.body.match(/```[a-z]*\n([\s\S]*?)```/i);
  const text = codeMatch ? codeMatch[1].trim() : p.body;
  copyToClipboard(text, codeMatch ? 'Prompt copied' : 'Body copied');
}

function copyToClipboard(text, label) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(
      () => showToast(label || 'Copied'),
      () => fallbackCopy(text, label)
    );
  } else {
    fallbackCopy(text, label);
  }
}

function fallbackCopy(text, label) {
  const t = document.createElement('textarea');
  t.value = text;
  t.style.position = 'fixed';
  t.style.opacity = '0';
  document.body.appendChild(t);
  t.select();
  try { document.execCommand('copy'); showToast(label || 'Copied'); }
  catch (e) { showToast('Copy failed — select manually'); }
  document.body.removeChild(t);
}

function downloadPrompt(id) {
  const p = state.prompts.find(x => x.id === id);
  if (!p) return;
  const fm = [
    '---',
    `title: ${p.title}`,
    `shelf: ${p.shelf}`,
    p.session ? `session: ${p.session}` : null,
    p.lesson ? `lesson: ${p.lesson}` : null,
    p.summary ? `summary: ${p.summary}` : null,
    p.date_filed ? `date_filed: ${p.date_filed}` : null,
    '---',
    '',
    p.body
  ].filter(x => x !== null).join('\n');
  const blob = new Blob([fm], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = p.filename || `${p.id}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Downloaded');
}

function saveEditFromForm(id) {
  const card = document.getElementById('modal-card');
  const title = card.querySelector('#edit-title').value;
  const shelf = card.querySelector('#edit-shelf').value;
  const summary = card.querySelector('#edit-summary').value;
  const body = card.querySelector('#edit-body').value;
  writeLocalEdit(id, { title, shelf, summary, body });
  state.prompts = applyLocalEdits(state.data.prompts);
  showToast('Saved locally');
  openPrompt(id, 'read');
}

function discardEdit(id) {
  if (!confirm('Discard your local edits to this prompt?')) return;
  clearLocalEdit(id);
  state.prompts = applyLocalEdits(state.data.prompts);
  showToast('Local edits discarded');
  openPrompt(id, 'read');
}

// -------------- MARKDOWN --------------
function renderMarkdown(text) {
  if (typeof marked === 'undefined') {
    return `<pre>${escapeHtml(text)}</pre>`;
  }
  const html = marked.parse(text, { breaks: false, mangle: false, headerIds: false });
  // Wrap each <pre><code> in a code-block-wrap with a copy button
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  wrapper.querySelectorAll('pre').forEach(pre => {
    const wrap = document.createElement('div');
    wrap.className = 'code-block-wrap';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
    const btn = document.createElement('button');
    btn.className = 'code-copy';
    btn.textContent = 'Copy block';
    wrap.appendChild(btn);
  });
  return wrapper.innerHTML;
}

// -------------- UTILS --------------
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.removeAttribute('hidden');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.setAttribute('hidden', ''), 1800);
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s) { return escapeHtml(s); }

function formatShortDate(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

function formatTime(d) {
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

// -------------- BOOT --------------
document.addEventListener('DOMContentLoaded', init);
