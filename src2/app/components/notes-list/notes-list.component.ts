import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note } from '../../models/note.model';
import { NotesService } from '../../services/notes.service';
import { ChatAiService } from '../../services/chat-ai.service';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { SummaryDialogComponent } from '../summary-dialog/summary-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MarkdownModule } from 'ngx-markdown';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Auth, authState } from '@angular/fire/auth';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TextFieldModule } from '@angular/cdk/text-field';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MarkdownModule,
    MatToolbarModule,
    TextFieldModule
  ],
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.css']
})
export class NotesListComponent implements OnInit, OnDestroy {
  notes: Note[] = [];
  editingNoteId: string | null = null; // Track which note is being edited
  originalNoteContent: string | null = null; // Store original content for cancel
  currentNote: { id: string, title: string, content: string } = { id: '', title: '', content: '' };
  summarizingNoteId: string | null = null;
  generatingNote: boolean = false;
  private notesSubscription: Subscription | undefined;
  userEmail: string | null = null;

  constructor(
    private notesService: NotesService,
    private chatAiService: ChatAiService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService, // Inject AuthService
    private router: Router, // Inject Router
    private auth: Auth // Inject Auth from @angular/fire/auth
  ) { }

  ngOnInit(): void {
    this.notesSubscription = this.notesService.getNotes().subscribe(notes => {
      this.notes = notes;
      console.log('Notes fetched:', this.notes);
      this.currentNote = { id: '', title: '', content: '' };
      this.editingNoteId = null;
    }, error => {
      console.error('Error fetching notes:', error);
      this.notes = [];
      this.currentNote = { id: '', title: '', content: '' };
      this.editingNoteId = null;
    });

    // Get user email
    authState(this.auth).subscribe(user => {
      this.userEmail = user ? user.email : null;
    });
  }

  ngOnDestroy(): void {
    this.notesSubscription?.unsubscribe();
  }

  async addNewNote(): Promise<void> { // Renamed from saveNote
    try {
      const newNote: Note = {
        id: null,
        title: this.currentNote.title,
        content: this.currentNote.content
      };
      await this.notesService.addNote(newNote);
      this.snackBar.open('Note added successfully!', 'Close', { duration: 3000 });
      // Reset form
      this.currentNote = { id: '', title: '', content: '' };
    } catch (error) {
      console.error('Error adding note:', error);
      this.snackBar.open('Error adding note. Please try again.', 'Close', { duration: 3000 });
    }
  }

  editNote(note: Note): void {
    this.editingNoteId = note.id ?? null;
    this.originalNoteContent = note.content; // Save original content
  }

  async updateEditedNote(note: Note): Promise<void> {
    if (!note.id) {
      this.snackBar.open('Error: Note ID is missing for update.', 'Close', { duration: 3000 });
      return;
    }
    try {
      await this.notesService.updateNote(note);
      this.snackBar.open('Note updated successfully!', 'Close', { duration: 3000 });
      this.editingNoteId = null; // Exit edit mode
      this.originalNoteContent = null; // Clear original content
    } catch (error) {
      console.error('Error updating note:', error);
      this.snackBar.open('Error updating note. Please try again.', 'Close', { duration: 3000 });
    }
  }

  cancelEdit(noteId: string): void {
    // Find the note in the array and revert its content if needed
    const noteToRevert = this.notes.find(n => n.id === noteId);
    if (noteToRevert && this.originalNoteContent !== null) {
      noteToRevert.content = this.originalNoteContent;
    }
    this.editingNoteId = null; // Exit edit mode
    this.originalNoteContent = null; // Clear original content
  }

  async deleteNote(id: string): Promise<void> {
    if (!id) {
      console.error('Note ID is required for deletion.');
      return;
    }
    console.log('Deleting note with ID:', id);
    try {
      await this.notesService.deleteNote(id);
      this.snackBar.open('Note deleted successfully!', 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Error deleting note:', error);
      this.snackBar.open('Error deleting note. Please try again.', 'Close', { duration: 3000 });
    }
  }

  async summarizeNote(note: Note): Promise<void> {
    if (!note.content) {
      this.snackBar.open('The note is empty, there is nothing to summarize.', 'Close', { duration: 3000 });
      return;
    }
    this.summarizingNoteId = note.id;
    try {
      const summary = await this.chatAiService.summarize(note.content);
      const dialogRef = this.dialog.open(SummaryDialogComponent, {
        data: { summary },
        width: '600px'
      });

      dialogRef.afterClosed().subscribe(async result => {
        if (result === true) {
          const updatedNote: Note = {
            id: note.id,
            title: note.title,
            content: summary
          };
          await this.notesService.updateNote(updatedNote);
          this.snackBar.open('Note replaced with summary successfully!', 'Close', { duration: 3000 });
        }
      });
    } catch (error) {
      console.error('Error summarizing note:', error);
      this.snackBar.open('There was an error summarizing the note. Please try again.', 'Close', { duration: 3000 });
    } finally {
      this.summarizingNoteId = null;
    }
  }

  async generateNoteWithAI(): Promise<void> {
    const topic = prompt('Enter a topic for the AI to generate a note about:');
    if (!topic) {
      this.snackBar.open('Note generation cancelled.', 'Close', { duration: 3000 });
      return;
    }

    this.generatingNote = true;
    try {
      const generated = await this.chatAiService.generateNote(topic);
      this.currentNote.title = generated.title;
      this.currentNote.content = generated.content;
      this.snackBar.open('Note generated successfully! Review and save.', 'Close', { duration: 5000 });
    } catch (error) {
      console.error('Error generating note:', error);
      this.snackBar.open('Error generating note. Please try again.', 'Close', { duration: 3000 });
    } finally {
      this.generatingNote = false;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }
}