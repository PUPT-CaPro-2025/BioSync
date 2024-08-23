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
  selector: 'app-prompt-confirm',
  standalone: true,
  imports: [
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle
  ],
  templateUrl: './prompt-confirm.component.html',
  styleUrl: './prompt-confirm.component.css'
})
export class PromptConfirmComponent {
  constructor(
    public dialogRef: MatDialogRef<PromptConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, message: string, action?: string }
  ) {}
}
