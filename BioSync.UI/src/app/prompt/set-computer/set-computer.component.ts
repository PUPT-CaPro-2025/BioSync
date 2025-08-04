import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {ClassResponse} from "../../../model/class.model";
import {FormsModule} from "@angular/forms";
import {ScheduleService} from "../../../services/schedule.service";
import {PromptOkayComponent} from "../prompt-okay/prompt-okay.component";
import {UserService} from "../../../services/user.service";
import {MatCheckbox} from "@angular/material/checkbox";

@Component({
  selector: 'app-set-computer',
  standalone: true,
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatFormField,
    MatInput,
    FormsModule,
    MatCheckbox,
  ],
  providers: [ScheduleService, UserService],
  templateUrl: './set-computer.component.html',
  styleUrl: './set-computer.component.css',
})
export class SetComputerComponent {
  newComputerNumber: string | null = null;
  isLaptop = false;

  constructor(
    public dialogRef: MatDialogRef<SetComputerComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: ClassResponse,
    private scheduleService: ScheduleService,
    private dialog: MatDialog
  ) {
    if(data.computerNumber < 0){
      this.isLaptop = true;
      this.newComputerNumber = "Laptop"
    } else {
      this.newComputerNumber = data.computerNumber.toString() || null;
    }
  }

  onLaptopToggle() {
    if (this.isLaptop) {
      this.newComputerNumber = 'Laptop';
    } else {
      this.newComputerNumber = '';
    }
  }

  openInvalid() {
    this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Value maybe invalid',
        message: 'Please double check and try again.'
      }
    })
  }

  onSubmit(){
    const newData = this.data;

    if( +this.newComputerNumber! < 1 ) {
      this.openInvalid();
      return;
    }

    newData.computerNumber = +this.newComputerNumber!;

    if(this.isLaptop){
      newData.computerNumber = -1;
    }

    this.scheduleService.setComputerNumber(newData).subscribe({
      next: () => {
        this.dialog.open(PromptOkayComponent, {
          width: '450px',
          height: '200px',
          data: {
            title: 'PC Assigned Successfully',
            message: `Computer has been successfully assigned to 
              ${this.data.student.lastName}`,
          }
        })
      },
      error: () => {
        this.dialog.open(PromptOkayComponent, {
          width: '350px',
          height: '250px',
          data: {
            title: 'Something Went Wrong',
            message: `Please try again later.`,
          }
        })
      }
    })
  }

}
