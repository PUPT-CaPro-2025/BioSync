import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatSelectModule} from '@angular/material/select';
import {MatInput} from "@angular/material/input";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import { CommonModule } from '@angular/common';
import {SubjectService} from "../subject/subject.service";
import {Subject} from "../../model/subject-model";
import {AddScheduleService} from "./add-schedule.service";
import {Schedule} from "../../model/schedule-model";
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../prompt-okay/prompt-okay.component";

@Component({
  selector: 'app-add-schedule',
  standalone: true,
  imports: [MatToolbarModule, MatSelectModule, CommonModule, MatInput, ReactiveFormsModule],
  providers: [SubjectService, AddScheduleService],
  templateUrl: './add-schedule.component.html',
  styleUrl: './add-schedule.component.css'
})
export class AddScheduleComponent implements OnInit{
  @Output() backToSchedule = new EventEmitter<void>();
  @Output() createdSchedule = new EventEmitter<Schedule>();

  selectedSubject!: Subject | undefined;

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
  subjects: Subject[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private subjectService: SubjectService,
    private addScheduleService: AddScheduleService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.initForm();
    this.getCurrentDate();
    this.getSubjects();
  }

  initForm(): void{
    this.scheduleForm = this.formBuilder.group({
        subject: ['', [Validators.required]],
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

  onSubjectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedId = Number(target.value)
    this.selectedSubject = this.subjects.find(subject => subject.id === selectedId);
  }

  cancelOrAddSchedule(): void {
    this.backToSchedule.emit();
  }


  getSubjects() {
    this.subjectService.getSubjects().subscribe({
      next: subjects => {
        console.log(subjects);
        this.subjects = subjects;
      }
    })
  }

  cancelAddSchedule(): void {
    this.backToSchedule.emit();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(PromptOkayComponent, {
      width: '400px'
    })

    dialogRef.afterClosed().subscribe(result => {
      this.backToSchedule.emit();
    })
  }

  createSchedule(schedule: Schedule){
    return this.addScheduleService
      .createSchedule(schedule)
      .subscribe({
        next: createdSchedule => {
          this.openDialog()
          this.createdSchedule.emit(createdSchedule)
        }
      })
  }

  submit() {
    this.scheduleForm.patchValue({
      subject: this.selectedSubject
    })
    let newSchedule = this.scheduleForm.value;

    const startYear = this.scheduleForm.get('startYear')?.value;
    const endYear = this.scheduleForm.get('endYear')?.value;
    const startTime = this.scheduleForm.get('startTime')?.value;
    const endTime = this.scheduleForm.get('endTime')?.value;

    newSchedule = {
      schoolYear: `${startYear}-${endYear}`,
      ...newSchedule,
      startTime: `${startTime}:00`,
      endTime: `${endTime}:00`,
    }

    console.log(newSchedule);

    this.createSchedule(newSchedule);
  }

}
