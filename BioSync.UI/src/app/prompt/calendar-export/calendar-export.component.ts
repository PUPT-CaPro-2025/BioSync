import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions, MatDialogClose, MatDialogContent,
  MatDialogRef, MatDialogTitle
} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-calendar-export',
  standalone: true,
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle
  ],
  templateUrl: './calendar-export.component.html',
  styleUrl: './calendar-export.component.css'
})
export class CalendarExportComponent {
  constructor(
      public dialogRef: MatDialogRef<CalendarExportComponent>,
      @Inject(MAT_DIALOG_DATA) public data: {
        generateFirstSemester : Function,
        generateSecondSemester : Function,
        generateSummerSemester : Function,
      }
  ) {}
}
