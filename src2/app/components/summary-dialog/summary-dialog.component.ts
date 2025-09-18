import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-summary-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MarkdownModule],
  templateUrl: './summary-dialog.component.html',
  styleUrls: ['./summary-dialog.component.css']
})
export class SummaryDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { summary: string }) { }
}