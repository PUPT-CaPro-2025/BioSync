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
import {filter} from "rxjs/operators";
import {AsyncPipe} from "@angular/common";

@Component({
    selector: 'app-add-to-schedule',
    templateUrl: './add-to-schedule.component.html',
    styleUrls: ['./add-to-schedule.component.css'],
    standalone: true,
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
export class AddToScheduleComponent implements OnInit {
    @ViewChild('input') input!: ElementRef<HTMLInputElement>;
    myControl = new FormControl('');
    options: User[] = [];
    filteredOptions!: Observable<User[]>;
    selectedUser!: User;

    constructor(
        public dialogRef: MatDialogRef<AddToScheduleComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {
            title: string,
            scheduleId: number
        },
        private userService: UserService,
    ) {
    }

    ngOnInit(): void {
        this.userService.getAllStudentsFilteredByScheduleId(
            this.data.scheduleId).subscribe({
            next: (event: User[]) => {
                this.options = event;

                this.filteredOptions = this.myControl.valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterUsers(value || ''))
                );
            }

        })
    }

    private _filterUsers(value: string): User[] {
        const filterValue = value.toLowerCase();
        return this.options.filter(user =>
            (user.firstName + ' ' + user.lastName).toLowerCase()
                .includes(filterValue) ||
            user.usercode.toLowerCase().includes(filterValue)
        );
    }

    onOptionSelected(event: MatAutocompleteSelectedEvent): void {
        const selectedUser = event.option.value;

        this.selectedUser = this.options.find(
            user => user.usercode === selectedUser)!;
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onAdd(): void {
        this.dialogRef.close(this.myControl.value);

        this.userService.addUserToSchedule(+this.data.scheduleId,
            this.selectedUser.id).subscribe({
            next: (event: User) => {
                console.log(event);
            }
        })
    }

    protected readonly filter = filter;
}
