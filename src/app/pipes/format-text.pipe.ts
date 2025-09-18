import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatText',
  standalone: true
})
export class FormatTextPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    
    return value
      // Convertir **texto** a <strong>texto</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convertir ## Título a <h3>Título</h3>
      .replace(/^## (.*$)/gm, '<h3>$1</h3>')
      // Convertir ### Título a <h4>Título</h4>
      .replace(/^### (.*$)/gm, '<h4>$1</h4>')
      // Convertir - Item a <li>Item</li>
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      // Envolver listas en <ul>
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      // Limpiar múltiples <ul> consecutivos
      .replace(/<\/ul>\s*<ul>/g, '')
      // Convertir saltos de línea dobles en párrafos
      .replace(/\n\n/g, '</p><p>')
      // Envolver todo en párrafos si no hay otros elementos HTML
      .replace(/^(?!<[hul])/gm, '<p>')
      .replace(/(?<!>)$/gm, '</p>')
      // Limpiar párrafos vacíos
      .replace(/<p><\/p>/g, '');
  }
}