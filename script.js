
class NoteItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.shadowRoot.querySelector('.delete-button').addEventListener('click', () => this.deleteNote());
  }

  render() {
    const { title, body } = JSON.parse(this.getAttribute('data'));
    this.shadowRoot.innerHTML = `
      <style>
        .note-item {
          border: 1px solid #ccc;
          padding: 10px;
          margin: 5px;
        }
        .note-item h2 {
          margin-top: 0;
        }
        .delete-button {
          background-color: #f44336;
          color: white;
          border: none;
          padding: 5px 10px;
          cursor: pointer;
        }
      </style>
      <div class="note-item">
        <h2>${title}</h2>
        <p>${body}</p>
        <button class="delete-button">Delete</button>
      </div>
    `;
  }

  deleteNote() {
    this.dispatchEvent(new CustomEvent('note-deleted', { bubbles: true, composed: true, detail: { noteId: this.getAttribute('data-id') } }));
  }
}
customElements.define('note-item', NoteItem);

// Custom Element: Notes List
class NotesList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .notes-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          grid-gap: 10px;
          padding: 10px;
        }
      </style>
      <div class="notes-container"></div>
    `;
  }

  connectedCallback() {
    if (!this.hasAttribute('data')) return;

    const notesData = JSON.parse(this.getAttribute('data'));
    const notesContainer = this.shadowRoot.querySelector('.notes-container');

    notesData.forEach((note, index) => {
      const noteItem = document.createElement('note-item');
      noteItem.setAttribute('data', JSON.stringify(note));
      noteItem.setAttribute('data-id', index);
      notesContainer.appendChild(noteItem);
    });
  }

  addNoteItem(note) {
    const notesContainer = this.shadowRoot.querySelector('.notes-container');
    const noteItem = document.createElement('note-item');
    noteItem.setAttribute('data', JSON.stringify(note));
    noteItem.setAttribute('data-id', notesContainer.children.length);
    notesContainer.appendChild(noteItem);
  }

  deleteNoteItem(noteId) {
    const notesContainer = this.shadowRoot.querySelector('.notes-container');
    const noteItem = notesContainer.querySelector(`[data-id="${noteId}"]`);
    if (noteItem) {
      noteItem.remove();
    }
  }
}
customElements.define('notes-list', NotesList);

// Data notes dummy
let notesData = [
  { title: 'Dicoding', body: 'Latihan Modul 4 Front End.' },
  { title: 'Kuliah', body: 'Mulai 16 Feb - 10 Juni 2024.' },
];

// Menampilkan daftar catatan dari data dummy
const notesList = document.createElement('notes-list');
notesList.setAttribute('data', JSON.stringify(notesData));
document.body.appendChild(notesList);

// Formulir Tambah Catatan
const addNoteForm = document.getElementById('add-note-form');
addNoteForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const title = document.getElementById('note-title').value;
  const body = document.getElementById('note-body').value;

  const newNote = { title, body };
  notesData.push(newNote);
  notesList.addNoteItem(newNote);

  addNoteForm.reset();
});

// Event listener untuk menghapus catatan
document.addEventListener('note-deleted', function(event) {
  const noteId = event.detail.noteId;
  notesList.deleteNoteItem(noteId);
});
