import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {
  MatAutocomplete,
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
  MatOption
} from '@angular/material/autocomplete';
import {MatFormField, MatInput, MatInputModule} from "@angular/material/input";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {UserService} from "../../../services/user.service";
import {User} from "../../../model/user.model";
import {ScheduleService} from "../../../services/schedule.service";
import {map, Observable, startWith} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {ClassResponse} from "../../../model/class.model";

@Component({
  selector: 'app-log-attendance',
  standalone: true,
  templateUrl: './log-attendance.component.html',
  styleUrls: ['./log-attendance.component.css', '../add-to-schedule/add-to-schedule.component.css'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatAutocompleteTrigger,
    ReactiveFormsModule,
    MatInput,
    MatFormField,
    MatDialogContent,
    MatAutocomplete,
    MatOption,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatDialogTitle,
    AsyncPipe,
  ],
  providers: [ScheduleService, UserService],
})
export class LogAttendanceComponent implements OnInit {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  myControl = new FormControl<string>('');
  options: User[] = [];
  filteredOptions!: Observable<User[]>;
  selectedUser!: User;

  constructor(
      public dialogRef: MatDialogRef<LogAttendanceComponent>,
      @Inject(MAT_DIALOG_DATA) public data: {
        title: string,
        scheduleId: number
      },
      private userService: UserService,
  ) {
  }

  ngOnInit(): void {
    this.userService.getUsersByScheduleId(
        this.data.scheduleId).subscribe({
      next: (classResponses: ClassResponse[]) => {
        classResponses.forEach((response) => {
          this.options.push(response.student)
        })

        this.filteredOptions = this.myControl.valueChanges.pipe(
            startWith(''),
            map(value => {
              const searchValue = (value || '').toLowerCase();
              return this._filterUsers(searchValue);
            })
        );
      }

    })
  }

  private _filterUsers(filterValue: string): User[] {
    return this.options.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const usercode = user.usercode.toLowerCase();
      const middleName = user.middleName?.toLowerCase() || '';

      return fullName.includes(filterValue) ||
          usercode.includes(filterValue) ||
          middleName.includes(filterValue);
    });
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedUsercode = event.option.value;
    this.selectedUser = this.options.find(user => user.usercode === selectedUsercode)!;
  }

  onAdd(): void {
    if(this.selectedUser.id == null) return;

    this.dialogRef.close(this.myControl.value);
  }

  displayFn = (usercode: string): string => {
    const user = this.options.find(user => user.usercode === usercode);
    return user ? `${user.usercode} | ${user.firstName} ${user.lastName}` : '';
  };

  get isValidSelection(): boolean {
    const inputValue = this.myControl.value?.toLowerCase() ?? '';
    return this.options.some(user =>
        user.usercode.toLowerCase() === inputValue
    );
  }
}
