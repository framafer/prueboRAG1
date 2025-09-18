import { Injectable } from '@angular/core';
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';
import { Note } from '../models/note.model';
import { Observable, of } from 'rxjs';
import { Auth, user } from '@angular/fire/auth';
import { switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private db = getFirestore();
  private notesCollection = collection(this.db, 'notes');

  constructor(private auth: Auth) { }

  async addNote(note: Note): Promise<void> {
    const currentUser = await user(this.auth).pipe(take(1)).toPromise();
    if (currentUser) {
      const { title, content } = note;
      await addDoc(this.notesCollection, { title, content, id_usuario: currentUser.uid });
    } else {
      throw new Error('User not authenticated.');
    }
  }

  getNotes(): Observable<Note[]> {
    return user(this.auth).pipe(
      switchMap(currentUser => {
        if (currentUser) {
          const q = query(this.notesCollection, where("id_usuario", "==", currentUser.uid));
          return new Observable<Note[]>(observer => {
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
              const notes: Note[] = [];
              querySnapshot.forEach((doc) => {
                notes.push({ id: doc.id, ...doc.data() } as Note);
              });
              observer.next(notes);
            });
            return () => unsubscribe();
          });
        } else {
          return of([]);
        }
      })
    );
  }

  async updateNote(note: Note): Promise<void> {
    if (!note.id) {
      throw new Error('Note id is required for update.');
    }
    const noteDoc = doc(this.db, 'notes', note.id);
    await updateDoc(noteDoc, { title: note.title, content: note.content });
  }

  async deleteNote(id: string): Promise<void> {
    const noteDoc = doc(this.db, 'notes', id);
    await deleteDoc(noteDoc);
  }
}
