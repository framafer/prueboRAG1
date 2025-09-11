import { Component } from '@angular/core';
import { RagService } from 'src/app/services/rag.service';
import { FormsModule } from '@angular/forms';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-chat-rag',
  templateUrl: './chat-rag.component.html',
  styleUrls: ['./chat-rag.component.css']
})
export class ChatRagComponent {
  messages: Message[] = [];
  userQuestion = '';
  loading = false;

  constructor(private ragService: RagService) {}

  sendMessage() {
    if (!this.userQuestion.trim()) return;

    // Añadir mensaje del usuario
    this.messages.push({ role: 'user', text: this.userQuestion });
    const question = this.userQuestion;
    this.userQuestion = '';
    this.loading = true;

    // Llamar a la función RAG
    this.ragService.ask(question, 'gemini').subscribe({
      next: (res) => {
        this.messages.push({ role: 'bot', text: res.answer });
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.messages.push({ role: 'bot', text: '❌ Error al obtener respuesta' });
        this.loading = false;
      }
    });
  }
}
