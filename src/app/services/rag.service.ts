import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface AskResponse {
  answer: string;
  context: { content: string; score: number }[];
}

@Injectable({ providedIn: 'root' })
export class RagService {
  private apiUrl = 'https://us-central1-TU_PROYECTO.cloudfunctions.net/askRAG';

  constructor(private http: HttpClient) {}

  ask(question: string, provider: 'openai' | 'gemini' = 'gemini'): Observable<AskResponse> {
    return this.http.post<AskResponse>(this.apiUrl, { question, provider });
  }
}
