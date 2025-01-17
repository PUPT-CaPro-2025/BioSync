import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-prompt-continue',
  standalone: true,
  imports: [
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle
  ],
  templateUrl: './prompt-continue.component.html',
  styleUrl: './prompt-continue.component.css'
})
export class PromptContinueComponent {
  constructor(
    public dialogRef: MatDialogRef<PromptContinueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, message: string, action?: string }
  ) {}
}
