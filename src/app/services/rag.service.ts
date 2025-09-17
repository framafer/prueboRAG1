import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RagService {
  private db;
  private genAI;

  constructor() {
    const app = initializeApp(environment.firebase);
    this.db = getFirestore(app);
    this.genAI = new GoogleGenerativeAI(environment.geminiApiKey);
  }

  async generarEmbedding(texto: string): Promise<number[]> {
    const model = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });

    const result = await model.embedContent(texto);
    return result.embedding.values;
  }

  async guardarChunk(texto: string): Promise<void> {
    try {
      const response = await fetch('https://guardartexto-p4shpmhckq-uc.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texto })
      });
      
      const result = await response.json();
      console.log('Chunk guardado via Function:', result);
    } catch (error: any) {
      console.error('Error al guardar chunk via Function:', error);
      throw error;
    }
  }

  ask(question: string, model: string): Observable<{ answer: string }> {
    return from(this.processQuestion(question, model));
  }

  private async processQuestion(question: string, model: string): Promise<{ answer: string }> {
    try {
      const response = await fetch('https://us-central1-prueborag1.cloudfunctions.net/preguntarRAG', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pregunta: question })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Chunks usados:', result.chunksUsados);
        console.log('Similitudes:', result.similitudes);
        return { answer: result.respuesta };
      } else {
        return { answer: 'Error: ' + result.error };
      }
    } catch (error) {
      console.error('Error al procesar pregunta:', error);
      return { answer: 'Error al procesar la pregunta' };
    }
  }
}
