import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChatAiService } from '../../services/chat-ai.service';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-chat-ai',
  standalone: true,
  imports: [RouterModule, FormsModule, MarkdownModule, NgIf],
  templateUrl: './chat-ai.component.html',
  styleUrls: ['./chat-ai.component.css']
})
export class ChatAiComponent {

  prompt = '';
  response = '';
  loading = false;

  constructor(private chatAiService: ChatAiService) { }

  async askRag() {
    if (!this.prompt.trim()) return;

    this.loading = true;
    this.response = '';

    try {
      const fullPrompt = this.prompt;
      this.response = await this.chatAiService.askRag(fullPrompt);
    } catch (error) {
      this.response = 'Ocurrió un error al procesar tu pregunta.';
      console.error(error);
    } finally {
      this.loading = false;
      this.prompt = '';
    }
  }
}
