// Get references
const urlInput = document.getElementById('urlInput');
const addBtn = document.getElementById('addBtn');
const urlList = document.getElementById('urlList');

// Add button click event
addBtn.addEventListener('click', () => {
  const url = urlInput.value.trim();
  if (url === "") return alert("Please enter a URL!");

  // Create dashbird card
  const card = document.createElement('div');
  card.className = 'dashbird-card';

  // URL text
  const urlText = document.createElement('span');
  urlText.textContent = url;
  card.appendChild(urlText);

  // Open button
  const openBtn = document.createElement('button');
  openBtn.textContent = 'Open';
  openBtn.className = 'open';
  openBtn.addEventListener('click', () => {
    window.open(url, '_blank');
  });
  card.appendChild(openBtn);

  // Select button
  const selectBtn = document.createElement('button');
  selectBtn.textContent = 'Select';
  selectBtn.className = 'select';
  selectBtn.addEventListener('click', () => {
    card.classList.toggle('selected');
  });
  card.appendChild(selectBtn);

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.className = 'delete';
  deleteBtn.addEventListener('click', () => {
    urlList.removeChild(card);
  });
  card.appendChild(deleteBtn);

  // Append card to list
  urlList.appendChild(card);

  // Clear input
  urlInput.value = '';
});
// script.js
// Safe link preview + OAuth-trigger UI for TikTok (legal consent-based access).
//
// IMPORTANT: This script DOES NOT and WILL NOT attempt to access private data
// (emails, phone numbers, passwords) without explicit user consent. To get
// private fields you must implement OAuth on your server and the user must
// authorize your app. Passwords are never accessible via OAuth and should
// never be requested or stored.
//
// Usage:
// - Include an element with id="link-input" (input or textarea) where users paste links.
// - Include a container with id="preview" where previews and actions will be shown.
// - Optional: enable simulated private-data mode for local UI testing by setting:
//     window.CYBERCITY_ENABLE_SIMULATED_PRIVATE_DATA = true
//   and optionally:
//     window.CYBERCITY_SIM_DATA = { email: "...", phone: "..." }
//
// - Server expectations (not provided here):
//   - GET /api/preview?url=...  => returns JSON { title, description, image, embedHtml }
//   - GET /auth/tiktok         => server route that redirects user to TikTok OAuth consent
//   - GET /api/tiktok/userinfo => returns JSON of authorized user fields for the session
//
// This script shows how to:
// 1) capture pasted URL
// 2) display public preview
// 3) present a clear OAuth button for the user to consent to share additional permitted fields

(function () {
  const ENABLE_SIMULATED_PRIVATE_DATA = !!window.CYBERCITY_ENABLE_SIMULATED_PRIVATE_DATA;
  const SIMULATED_PRIVATE_DATA = window.CYBERCITY_SIM_DATA || {
    email: 'simulated-user@example.test',
    phone: '+1-555-555-0000',
    note: 'SIMULATED DATA — for local testing only'
  };

  // Utilities
  function extractUrlFromText(text) {
    if (!text) return null;
    const m = text.match(/https?:\/\/[^\s)]+/i);
    return m ? m[0].replace(/[,\]\)\.]+$/, '') : null;
  }

  function el(tag, attrs = {}, children = []) {
    const e = document.createElement(tag);
    for (const k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(c => e.appendChild(c));
    return e;
  }

  function clearPreview() {
    const container = document.getElementById('preview');
    if (!container) return null;
    container.innerHTML = '';
    return container;
  }

  function renderError(msg) {
    const c = clearPreview();
    if (!c) return;
    const d = el('div', { class: 'preview-error' });
    d.textContent = msg;
    d.style.color = 'crimson';
    c.appendChild(d);
  }

  // Render public preview and OAuth CTA for TikTok
  function renderPreview(data = {}, url) {
    const c = clearPreview();
    if (!c) return;
    const wrapper = el('div', { class: 'link-preview' });

    const title = el('a', { href: url || '#', target: '_blank', rel: 'noopener noreferrer' });
    title.textContent = data.title || url || 'Link';
    title.style.display = 'block';
    title.style.fontWeight = '600';
    wrapper.appendChild(title);

    if (data.image) {
      const img = el('img', { src: data.image, alt: data.title || 'preview image' });
      img.style.maxWidth = '320px';
      img.style.display = 'block';
      img.style.marginTop = '8px';
      wrapper.appendChild(img);
    }

    if (data.description) {
      const p = el('p');
      p.textContent = data.description;
      wrapper.appendChild(p);
    }

    if (data.embedHtml) {
      const embed = el('div', { class: 'embed', html: data.embedHtml });
      embed.style.marginTop = '8px';
      wrapper.appendChild(embed);
    }

    const note = el('small');
    note.style.display = 'block';
    note.style.marginTop = '8px';
    note.style.color = '#666';
    note.textContent = 'This shows only public metadata. To access additional permitted profile fields, the TikTok account owner must explicitly log in and consent.';
    wrapper.appendChild(note);

    // If the URL is a tiktok.com link, add explicit OAuth button to request consent
    try {
      if (url) {
        const parsed = new URL(url);
        const host = parsed.hostname.toLowerCase();
        if (host.includes('tiktok.com')) {
          const hr = el('hr');
          wrapper.appendChild(hr);

          const oauthNote = el('div');
          oauthNote.style.margin = '8px 0';
          oauthNote.style.fontWeight = '600';
          oauthNote.textContent = 'Want authorized info from this TikTok account?';
          wrapper.appendChild(oauthNote);

          const oauthDesc = el('div');
          oauthDesc.style.color = '#444';
          oauthDesc.textContent = 'Click the button below to have the account owner sign in and explicitly grant your app permission to access permitted profile fields.';
          wrapper.appendChild(oauthDesc);

          const btnRow = el('div', { style: 'margin-top:8px' });
          const loginBtn = el('button');
          loginBtn.textContent = 'Log in with TikTok (consent required)';
          loginBtn.style.cursor = 'pointer';
          loginBtn.onclick = () => {
            // Open the server-side OAuth start route. The server should redirect to TikTok.
            // Use popup so user returns to your page; server should set session/cookie for later /api/tiktok/userinfo call.
            const popup = window.open('/auth/tiktok', 'tiktok_oauth', 'width=600,height=700');
            if (!popup) {
              // fallback: navigate
              window.location.href = '/auth/tiktok';
              return;
            }
            // Poll popup for completion: after OAuth completes the server can redirect to a small page that closes itself and optionally
            // communicates via postMessage; here we poll server-side endpoint to detect authorized session.
            const interval = setInterval(async () => {
              try {
                const r = await fetch('/api/tiktok/userinfo', { credentials: 'same-origin' });
                if (r.ok) {
                  const j = await r.json();
                  clearInterval(interval);
                  if (popup && !popup.closed) popup.close();
                  // Display authorized info returned by server (only fields server is permitted to provide)
                  showAuthorizedInfo(j);
                }
              } catch (err) {
                // not authorized yet or popup blocked; ignore and continue polling
              }
              if (popup && popup.closed) {
                clearInterval(interval);
              }
            }, 1500);
          };
          btnRow.appendChild(loginBtn);

          // For local testing, allow a simulated reveal button
          if (ENABLE_SIMULATED_PRIVATE_DATA) {
            const simBtn = el('button');
            simBtn.textContent = 'Reveal simulated authorized data (local test)';
            simBtn.style.marginLeft = '8px';
            simBtn.onclick = () => {
              showAuthorizedInfo({ simulated: true, ...SIMULATED_PRIVATE_DATA });
            };
            btnRow.appendChild(simBtn);
          }

          wrapper.appendChild(btnRow);
        }
      }
    } catch (err) {
      // ignore URL parse errors
    }

    c.appendChild(wrapper);
  }

  function showAuthorizedInfo(userObj) {
    const c = clearPreview();
    if (!c) return;
    const wrapper = el('div');

    const heading = el('h3');
    heading.textContent = 'Authorized profile data (from server)';
    wrapper.appendChild(heading);

    const note = el('div');
    note.style.color = '#444';
    note.style.marginBottom = '8px';
    note.textContent = 'This data was provided by your server after the TikTok account owner explicitly authorized access. Only fields granted by TikTok and allowed by your app will appear. Passwords are never available.';
    wrapper.appendChild(note);

    const pre = el('pre');
    pre.textContent = JSON.stringify(userObj, null, 2);
    pre.style.background = '#f5f5f5';
    pre.style.padding = '8px';
    pre.style.borderRadius = '4px';
    wrapper.appendChild(pre);

    c.appendChild(wrapper);
  }

  // Fetch public preview via server proxy
  async function fetchPreview(url) {
    try {
      const resp = await fetch('/api/preview?url=' + encodeURIComponent(url), { credentials: 'same-origin' });
      if (!resp.ok) throw new Error('Preview endpoint returned ' + resp.status);
      const json = await resp.json();
      // Normalize fields
      return {
        title: json.title || json.author_name || null,
        description: json.description || null,
        image: json.image || json.thumbnail_url || null,
        embedHtml: json.embedHtml || json.html || null
      };
    } catch (err) {
      throw err;
    }
  }

  // Paste handler
  async function onPaste(e) {
    try {
      const clipboard = (e.clipboardData || window.clipboardData);
      const text = clipboard.getData('text');
      const url = extractUrlFromText(text);
      if (!url) return;

      const container = document.getElementById('preview');
      if (container) container.innerHTML = 'Loading preview...';

      // Try server-backed preview first (recommended)
      try {
        const data = await fetchPreview(url);
        renderPreview(data, url);
        return;
      } catch (err) {
        console.warn('Server preview failed:', err);
      }

      // Fallback: minimal preview
      renderPreview({ title: url }, url);
    } catch (err) {
      console.error('onPaste error', err);
      renderError('Could not fetch preview. ' + (err.message || ''));
    }
  }

  // Attach listener
  function attach(selector) {
    const elTarget = selector ? document.querySelector(selector) : document;
    if (!elTarget) {
      document.addEventListener('paste', onPaste);
    } else {
      elTarget.addEventListener('paste', onPaste);
    }
  }

  // Auto-init if #link-input present, otherwise attach to document
  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('link-input')) {
      attach('#link-input');
    } else {
      attach();
    }
  });

  // Expose for manual init
  window.cyberCityLinkPreviewInit = function (selector) {
    attach(selector);
  };
})();
