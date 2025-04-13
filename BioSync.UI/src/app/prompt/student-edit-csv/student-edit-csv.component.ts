import {Component, Inject} from '@angular/core';
import {environment} from "../../../../environment/app.setting";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef, MatDialogTitle
} from "@angular/material/dialog";
import {UserService} from "../../../services/user.service";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-student-edit-csv',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatProgressSpinner,
    MatDialogClose,
    MatButton,
    MatDialogTitle
  ],
  providers: [UserService],
  templateUrl: './student-edit-csv.component.html',
  styleUrl: './student-edit-csv.component.css'
})
export class StudentEditCsvComponent {
  templateLink = environment.templateLink;
  csvFile!: File;
  submitted = false;
  success = false;
  error = false;
  count = 0;

  constructor(
    public dialogRef: MatDialogRef<StudentEditCsvComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { scheduleId : number },
    private userService: UserService,
  ) {}

  handleFileInput(event: any) {
    this.csvFile = event.target.files[0];
  }

  submit() {
    if(!this.csvFile) return;

    this.submitted = true;
    const formData = new FormData();
    formData.append('file', this.csvFile);
    if(this.data.scheduleId != null){
      formData.append('scheduleId', this.data.scheduleId.toString());
    }

    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    this.userService.processBulkStudentUpdate(formData).subscribe({
      next: (value: any) => {
        if(value.success){
          this.count = value.students.length
          this.success = true;
        }
      },
      error: () => this.error = true
    })
  }



}
