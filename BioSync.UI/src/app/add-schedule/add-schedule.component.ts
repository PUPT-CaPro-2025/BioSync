import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatSelectModule} from '@angular/material/select';
import {MatInput} from "@angular/material/input";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-add-schedule',
  standalone: true,
  imports: [MatToolbarModule, MatSelectModule, MatInput, ReactiveFormsModule],
  templateUrl: './add-schedule.component.html',
  styleUrl: './add-schedule.component.css'
})
export class AddScheduleComponent implements OnInit{
  @Output() backToSchedule = new EventEmitter<void>();
  sections: string[] = [
    'BSIT 4-1',
    'BSIT 3-1',
    'BSIT 2-1',
    'BSIT 1-1',
  ];

  labs: string[] = [
    'DOST Laboratory',
    'Aboitiz Laboratory',
  ];

  professors: string[] = [
    'Gecilie Almirañez',
    'Dustin Santos',
    'Jhean Galope',
    'Steven Villarosa',
    'Nikki Dela Rosa',
    'Lady Minette Modesto'
  ];

  semesters: string[] = [
    '1st Semester',
    '2nd Semester',
    'Summer'
  ];

  remarks: string[] = [
    'Laboratory'
  ];

  scheduleForm!: FormGroup;
  today!: string;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.initForm();
    this.getCurrentDate();
  }

  initForm(): void{
    this.scheduleForm = this.formBuilder.group({
        section: ['', [Validators.required]],
        startTime: ['', Validators.required],
        endTime: ['', [Validators.required]],
        scheduleDate: ['', [Validators.required]],
        labRoom: ['', [Validators.required]],
        professor: ['', [Validators.required]],
        semester: ['', [Validators.required]],
        startYear: [new Date().getFullYear(), [Validators.required]],
        endYear: [new Date().getFullYear() + 1, [Validators.required]],
        remarks: ['', [Validators.required]]
      }
    )
  }

  getCurrentDate () {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    this.today = `${year}-${month}-${day}`;
  }

  cancelAddSchedule(): void {
    this.backToSchedule.emit();
  }

  submit() {
    console.log(this.scheduleForm.value);
  }

}
