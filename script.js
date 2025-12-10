/*
  script.js
  - Vanilla JavaScript for adding/removing/selecting "cyberpunk" dashbird cards.
  - Assumes the page contains:
      <input id="urlInput" />
      <button id="addBtn">Add</button>
      <div id="urlList"></div>
  - No frameworks. Uses event listeners and event delegation so it scales to unlimited cards.
*/

/* Wait until DOM is ready so we can safely query elements */
document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('urlInput');
  const addBtn = document.getElementById('addBtn');
  const urlList = document.getElementById('urlList');

  // If some expected elements are missing, notify in console and stop.
  if (!urlInput || !addBtn || !urlList) {
    console.warn(
      'script.js: Missing required elements. Make sure your page has #urlInput, #addBtn and #urlList.'
    );
    return;
  }

  // A small counter to help create unique ids (optional).
  let idCounter = 0;

  // Add URL when Add button is clicked
  addBtn.addEventListener('click', () => {
    handleAddUrl();
  });

  // Also add when user presses Enter in the input
  urlInput.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      handleAddUrl();
    }
  });

  // Core "add" flow: read input, normalize/validate, create card, append to list
  function handleAddUrl() {
    const raw = urlInput.value.trim();
    if (!raw) {
      urlInput.focus();
      return;
    }

    const normalized = normalizeUrl(raw);
    if (!normalized) {
      // Simple user feedback for invalid URL
      window.alert('Please enter a valid URL (for example: example.com or https://example.com).');
      urlInput.focus();
      return;
    }

    const card = createCard(normalized);
    urlList.appendChild(card);

    // Clear input and focus for next entry
    urlInput.value = '';
    urlInput.focus();
  }

  // Normalize URL:
  // - If the user omitted the scheme (http/https), prepend https://
  // - Return a fully-qualified href (string) or null if invalid
  function normalizeUrl(input) {
    try {
      let candidate = input;
      // If no scheme present, add https:// so new URL(...) works
      if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(candidate)) {
        candidate = 'https://' + candidate;
      }
      const u = new URL(candidate); // will throw if invalid
      return u.href;
    } catch (err) {
      return null;
    }
  }

  // Create a card DOM node for a given normalized URL
  function createCard(url) {
    idCounter++;

    const card = document.createElement('div');
    card.className = 'dashbird-card'; // for CSS styling
    card.dataset.url = url; // store the URL so controls can read it
    card.id = `dashbird-card-${Date.now()}-${idCounter}`;

    // URL text area (shows full URL)
    const urlText = document.createElement('div');
    urlText.className = 'card-url';
    urlText.textContent = url;

    // Controls container
    const controls = document.createElement('div');
    controls.className = 'card-controls';

    // Open/Visit button
    const openBtn = document.createElement('button');
    openBtn.type = 'button';
    openBtn.className = 'btn btn-open';
    openBtn.textContent = 'Open';
    openBtn.title = 'Open link in a new tab';
    openBtn.setAttribute('aria-label', `Open ${url} in a new tab`);
    openBtn.dataset.action = 'open'; // used by event delegation

    // Select button
    const selectBtn = document.createElement('button');
    selectBtn.type = 'button';
    selectBtn.className = 'btn btn-select';
    selectBtn.textContent = 'Select';
    selectBtn.title = 'Select this card';
    selectBtn.setAttribute('aria-pressed', 'false');
    selectBtn.dataset.action = 'select';

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.title = 'Delete this card';
    deleteBtn.dataset.action = 'delete';

    // Assemble controls
    controls.appendChild(openBtn);
    controls.appendChild(selectBtn);
    controls.appendChild(deleteBtn);

    // Put everything inside the card
    card.appendChild(urlText);
    card.appendChild(controls);

    return card;
  }

  // Use event delegation on the container to handle button clicks for any card:
  // - open: opens the URL in a new tab (noopener noreferrer for security)
  // - select: toggles "selected" state (visually highlighted via CSS)
  // - delete: removes the card from the DOM
  urlList.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    if (!action) return;

    const card = btn.closest('.dashbird-card');
    if (!card) return;

    const cardUrl = card.dataset.url;

    if (action === 'open') {
      // Open the link in a new tab safely
      window.open(cardUrl, '_blank', 'noopener,noreferrer');
    } else if (action === 'select') {
      // By design: make selection exclusive (only one highlighted at a time).
      // If you prefer multiple selection, change this behavior to card.classList.toggle('selected') only.
      const previouslySelected = urlList.querySelector('.dashbird-card.selected');
      if (previouslySelected && previouslySelected !== card) {
        previouslySelected.classList.remove('selected');
        const prevSelectBtn = previouslySelected.querySelector('.btn-select');
        if (prevSelectBtn) prevSelectBtn.setAttribute('aria-pressed', 'false');
      }

      const isNowSelected = card.classList.toggle('selected');
      // Update aria-pressed for accessibility
      const selectBtn = card.querySelector('.btn-select');
      if (selectBtn) selectBtn.setAttribute('aria-pressed', isNowSelected ? 'true' : 'false');

      // Optional nicety: scroll selected card into view
      if (isNowSelected) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else if (action === 'delete') {
      // Remove from DOM completely
      card.remove();
    }
  });

  // Extra keyboard utility: Delete selected card with Delete key
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Delete') {
      const selected = urlList.querySelector('.dashbird-card.selected');
      if (selected) selected.remove();
    }
  });
});
