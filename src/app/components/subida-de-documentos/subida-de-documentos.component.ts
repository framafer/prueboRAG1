import { Component } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import { RagService } from '../../services/rag.service';

// Worker de PDF.js
(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;

@Component({
  selector: 'app-subida-de-documentos',
  templateUrl: './subida-de-documentos.component.html',
  styleUrls: ['./subida-de-documentos.component.css']
})
export class SubidaDeDocumentosComponent {
  selectedFile: File | null = null;
  chunks: string[] = [];

  constructor(private ragService: RagService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  async procesarPDF() {
    if (!this.selectedFile) {
      alert('Por favor selecciona un archivo PDF primero.');
      return;
    }

    try {
      const arrayBuffer = await this.selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let textContent = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        const pageText = text.items.map((item: any) => item.str).join(' ');
        textContent += ` ${pageText}`;
      }

      this.chunks = this.dividirEnChunksConOverlap(textContent.trim(), 500, 100);
      alert(`PDF procesado. Subiendo ${this.chunks.length} chunks a Firestore...`);

      for (const chunk of this.chunks) {
        await this.ragService.guardarChunk(chunk);
      }

      alert('Todos los chunks fueron guardados en Firestore ✅');
    } catch (error) {
      console.error('Error al procesar el PDF:', error);
      alert('Hubo un problema al procesar el PDF.');
    }
  }

  dividirEnChunksConOverlap(texto: string, chunkSize: number, overlap: number): string[] {
    const palabras = texto.split(' ');
    const chunks: string[] = [];
    let inicio = 0;

    while (inicio < palabras.length) {
      let fin = inicio;
      let longitudActual = 0;

      // Construir chunk hasta el tamaño máximo
      while (fin < palabras.length && longitudActual + palabras[fin].length + 1 <= chunkSize) {
        longitudActual += palabras[fin].length + 1; // +1 por el espacio
        fin++;
      }

      // Crear el chunk
      const chunk = palabras.slice(inicio, fin).join(' ');
      if (chunk.trim().length > 0) {
        chunks.push(chunk.trim());
      }

      // Calcular siguiente inicio con overlap
      if (fin >= palabras.length) break;
      
      // Retroceder para crear overlap
      let overlapPalabras = 0;
      let overlapLength = 0;
      
      for (let i = fin - 1; i >= inicio && overlapLength < overlap; i--) {
        overlapLength += palabras[i].length + 1;
        overlapPalabras++;
      }
      
      inicio = Math.max(inicio + 1, fin - overlapPalabras);
    }

    return chunks;
  }
}
