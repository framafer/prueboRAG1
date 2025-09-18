import { Injectable } from '@angular/core';
import { Note } from '../models/note.model';
import { FirestoreService } from './firestore.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotesService {

  constructor(private firestoreService: FirestoreService) { }

  getNotes(): Observable<Note[]> {
    return this.firestoreService.getNotes();
  }

  async addNote(note: Note): Promise<void> {
    await this.firestoreService.addNote(note);
  }

  async deleteNote(id: string): Promise<void> {
    await this.firestoreService.deleteNote(id);
  }

  async updateNote(note: Note): Promise<void> { // Changed to accept the full note object
    await this.firestoreService.updateNote(note);
  }
}