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
import {environment} from "../../../../environment/app.setting";
import {MatTabLink} from "@angular/material/tabs";
import {FormsModule} from "@angular/forms";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatIcon} from "@angular/material/icon";
import {UserService} from "../../../services/user.service";

@Component({
  selector: 'app-prompt-csv',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatDialogTitle,
    MatTabLink,
    FormsModule,
    MatProgressSpinner,
    MatIcon
  ],
  providers: [UserService],
  templateUrl: './prompt-csv.component.html',
  styleUrl: './prompt-csv.component.css'
})
export class PromptCsvComponent {
  templateLink = environment.templateLink;
  csvFile!: File;
  submitted = false;
  success = false;
  error = false;
  count = 0;

  constructor(
    public dialogRef: MatDialogRef<PromptCsvComponent>,
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

    this.userService.createBulkUserOrSchedule(formData).subscribe({
      next: (value) => {
        console.log(value)
        if(value.success){
          this.success = true;
          this.count = value.count;
        }
      },
      error: () => this.error = true
    })
  }




}
