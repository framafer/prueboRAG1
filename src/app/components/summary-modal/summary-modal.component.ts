import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatTextPipe } from '../../pipes/format-text.pipe';

@Component({
  selector: 'app-summary-modal',
  standalone: true,
  imports: [CommonModule, FormatTextPipe],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Resumen de la Nota</h3>
        <div class="summary-content" [innerHTML]="summary | formatText"></div>
        <div class="modal-actions">
          <button class="replace-button" (click)="onReplace()">Reemplazar Nota</button>
          <button class="cancel-button" (click)="onCancel()">Cancelar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .summary-content {
      margin: 1rem 0;
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 4px;
      line-height: 1.6;
    }
    
    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }
    
    .replace-button {
      background-color: #4caf50;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .cancel-button {
      background-color: #9e9e9e;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    
    button:hover {
      opacity: 0.9;
    }
  `]
})
export class SummaryModalComponent {
  @Input() isVisible = false;
  @Input() summary = '';
  @Output() replace = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();

  onReplace() {
    this.replace.emit(true);
  }

  onCancel() {
    this.cancel.emit();
  }
}