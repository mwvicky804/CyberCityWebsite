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
