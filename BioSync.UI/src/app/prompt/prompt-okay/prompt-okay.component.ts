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
  selector: 'app-prompt-okay',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose
  ],
  templateUrl: './prompt-okay.component.html',
  styleUrl: './prompt-okay.component.css'
})
export class PromptOkayComponent {
  constructor(
    public dialogRef: MatDialogRef<PromptOkayComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, message: string }
  ) {}
}
