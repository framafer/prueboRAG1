import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotesService } from '../../services/notes.service';
import { ChatAiService } from '../../services/chat-ai.service';
import { Note } from '../../models/note.model';
import { Subscription } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth';
import { FormatTextPipe } from '../../pipes/format-text.pipe';
import { SummaryModalComponent } from '../summary-modal/summary-modal.component';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatTextPipe, SummaryModalComponent],
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.css']
})
export class NotesListComponent implements OnInit, OnDestroy {
  notes: Note[] = [];
  editingNoteId: string | null = null;
  originalNoteContent: string | null = null;
  currentNote: { id: string, title: string, content: string } = { id: '', title: '', content: '' };
  generatingNote: boolean = false;
  summarizingNoteId: string | null = null;
  showSummaryModal = false;
  currentSummary = '';
  noteToUpdate: Note | null = null;
  private notesSubscription: Subscription | undefined;
  userEmail: string | null = null;

  constructor(
    public authService: AuthService,
    private router: Router,
    private notesService: NotesService,
    private chatAiService: ChatAiService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.notesSubscription = this.notesService.getNotes().subscribe(notes => {
      this.notes = notes;
      this.currentNote = { id: '', title: '', content: '' };
      this.editingNoteId = null;
    });

    authState(this.auth).subscribe(user => {
      this.userEmail = user ? user.email : null;
    });
  }

  ngOnDestroy(): void {
    this.notesSubscription?.unsubscribe();
  }

  async addNewNote(): Promise<void> {
    try {
      const newNote: Note = {
        id: null,
        title: this.currentNote.title,
        content: this.currentNote.content
      };
      await this.notesService.addNote(newNote);
      this.currentNote = { id: '', title: '', content: '' };
    } catch (error) {
      console.error('Error adding note:', error);
    }
  }

  editNote(note: Note): void {
    this.editingNoteId = note.id ?? null;
    this.originalNoteContent = note.content;
  }

  async updateEditedNote(note: Note): Promise<void> {
    if (!note.id) return;
    try {
      await this.notesService.updateNote(note);
      this.editingNoteId = null;
      this.originalNoteContent = null;
    } catch (error) {
      console.error('Error updating note:', error);
    }
  }

  cancelEdit(noteId: string): void {
    const noteToRevert = this.notes.find(n => n.id === noteId);
    if (noteToRevert && this.originalNoteContent !== null) {
      noteToRevert.content = this.originalNoteContent;
    }
    this.editingNoteId = null;
    this.originalNoteContent = null;
  }

  async deleteNote(id: string): Promise<void> {
    if (!id) return;
    try {
      await this.notesService.deleteNote(id);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

  async generateNoteWithAI(): Promise<void> {
    const topic = prompt('Introduce un tema para que la IA genere una nota:');
    if (!topic) {
      return;
    }

    this.generatingNote = true;
    try {
      const generated = await this.chatAiService.generateNote(topic);
      this.currentNote.title = generated.title;
      this.currentNote.content = generated.content;
    } catch (error) {
      console.error('Error generating note:', error);
    } finally {
      this.generatingNote = false;
    }
  }

  async summarizeNote(note: Note): Promise<void> {
    if (!note.content) {
      alert('La nota está vacía, no hay nada que resumir.');
      return;
    }
    
    this.summarizingNoteId = note.id;
    try {
      const summary = await this.chatAiService.summarize(note.content);
      this.currentSummary = summary;
      this.noteToUpdate = note;
      this.showSummaryModal = true;
    } catch (error) {
      console.error('Error summarizing note:', error);
      alert('Error al resumir la nota. Inténtalo de nuevo.');
    } finally {
      this.summarizingNoteId = null;
    }
  }

  async onSummaryReplace(replace: boolean): Promise<void> {
    if (replace && this.noteToUpdate && this.noteToUpdate.id) {
      const updatedNote: Note = {
        id: this.noteToUpdate.id,
        title: this.noteToUpdate.title,
        content: this.currentSummary
      };
      await this.notesService.updateNote(updatedNote);
    }
    this.closeSummaryModal();
  }

  closeSummaryModal(): void {
    this.showSummaryModal = false;
    this.currentSummary = '';
    this.noteToUpdate = null;
  }

  goToChat() {
    this.router.navigate(['/chat']);
  }

  trackByFn(index: number, item: Note): any {
    return item.id;
  }
}