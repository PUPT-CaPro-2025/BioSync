import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-prompt-sync',
  standalone: true,
  imports: [
    MatProgressSpinner
  ],
  templateUrl: './prompt-sync.component.html',
  styleUrl: './prompt-sync.component.css'
})
export class PromptSyncComponent {

  constructor(
    public dialogRef: MatDialogRef<PromptSyncComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { scheduleId : number },
  ) {}
}
