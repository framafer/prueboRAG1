import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatAiService {
  private generativeAI: GoogleGenerativeAI;

  constructor() {
    this.generativeAI = new GoogleGenerativeAI('AIzaSyBf9Fdc5GZ6JWeDrHrVQSmDuvKAEhaHUwY');
  }

  async getCompletion(prompt: string): Promise<string> {
    try {
      const model = this.generativeAI.getGenerativeModel({ model: 'gemini-1.5-flash'});
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting completion:', error);
      return `Error getting completion: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  async generateNote(topic: string): Promise<{ title: string, content: string }> {
    const systemPrompt = `
      Eres un asistente de IA experto en la creación de notas.
      Tu tarea es generar una nota completa (título y contenido) sobre el tema proporcionado.
      La nota debe ser informativa y bien estructurada usando formato Markdown.
      Usa encabezados (##), listas (-), texto en negrita (**texto**) y otros elementos de Markdown.
      Formato de salida estricto:
      Título: [Tu título aquí]
      Contenido: [Tu contenido en formato Markdown aquí]
      Tema para la nota:
    `;
    const fullPrompt = `${systemPrompt} ${topic}`;
    const rawResponse = await this.getCompletion(fullPrompt);

    // Parse the response to extract title and content
    const titleMatch = rawResponse.match(/Título:\s*(.*)\n/);
    const contentMatch = rawResponse.match(/Contenido:\s*([\s\S]*)/);

    const title = titleMatch && titleMatch[1] ? titleMatch[1].trim() : 'Generated Note';
    const content = contentMatch && contentMatch[1] ? contentMatch[1].trim() : 'Could not generate content for this topic.';

    return { title, content };
  }

  async summarize(noteContent: string): Promise<string> {
    const systemPrompt = `
      Eres un asistente de IA experto en resumir textos.
      Tu tarea es crear un resumen conciso y claro del siguiente texto.
      El resumen debe capturar las ideas principales y los puntos clave.
      Utiliza un formato de lista con viñetas si es apropiado para el contenido.
      El texto a resumir es:
    `;
    const fullPrompt = `${systemPrompt} ${noteContent}`;
    return this.getCompletion(fullPrompt);
  }
}