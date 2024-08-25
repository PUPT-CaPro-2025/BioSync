import {Component, Output, EventEmitter, OnInit, ChangeDetectorRef} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatSelectChange, MatSelectModule} from '@angular/material/select';
import {MatInput} from "@angular/material/input";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule, DatePipe} from '@angular/common';
import {SubjectService} from "../../services/subject.service";
import {Subject} from "../../model/subject-model";
import {AddScheduleService} from "../../services/add-schedule.service";
import {Schedule} from "../../model/schedule.model";
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../prompt-okay/prompt-okay.component";
import {User} from "../../model/user.model";
import {UserService} from "../../services/user.service";
import { CustomRecurrenceModalComponent } from '../custom-recurrence-modal/custom-recurrence-modal.component';
import {MatDatepicker, MatDatepickerInput} from "@angular/material/datepicker";
import {MatButton} from "@angular/material/button";
import {provideNativeDateAdapter} from "@angular/material/core";
import {MatIcon} from "@angular/material/icon";
import {SectionService} from "../../services/section.service";
import {Section} from "../../model/section.model";
import {SchoolYearService} from "../../services/school.year.service";
import {SchoolYear} from "../../model/school.year.model";
import {Semester} from "../../model/semester.model";
import {Laboratory} from "../../model/laboratory.model";
import {LaboratoryService} from "../../services/laboratory.service";

@Component({
  selector: 'app-add-schedule',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatSelectModule,
    CommonModule,
    MatInput,
    ReactiveFormsModule,
    CustomRecurrenceModalComponent,
    MatDatepicker,
    MatDatepickerInput,
    MatButton,
    MatIcon
  ],
  providers: [
    SubjectService,
    AddScheduleService,
    UserService,
    provideNativeDateAdapter(),
    DatePipe,
    SectionService,
    SchoolYearService,
    LaboratoryService
  ],
  templateUrl: './add-schedule.component.html',
  styleUrl: './add-schedule.component.css'
})
export class AddScheduleComponent implements OnInit{
  constructor(
    private formBuilder: FormBuilder,
    private subjectService: SubjectService,
    private addScheduleService: AddScheduleService,
    private dialog: MatDialog,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private sectionService: SectionService,
    private schoolYearService: SchoolYearService,
    private laboratoryService: LaboratoryService
  ) {}
  @Output() backToSchedule = new EventEmitter<void>();
  @Output() createdSchedule = new EventEmitter<Schedule>();

  selectedSubject!: Subject | undefined;

  sections: Section[] = [];

  dateRecurrence: string[] = [
    'Does not Repeat',
    'Daily',
    'Weekly'
  ];

  labs: Laboratory[] = [];

  professors: User[] = [];

  semesters: Semester[] = [];

  remarks: string[] = [
    'Laboratory'
  ];

  selectedRecurrence = 'none';
  previousRecurrence = 'none';
  currentDayOfWeek = this.getDayOfWeek(new Date());
  currentDate = this.getFormattedDate(new Date());
  currentWeekOfMonth = this.getWeekOfMonth(new Date());
  isCustomRecurrenceVisible = false;

  customRecurrence = {
    repeatEvery: 1,
    period: 'week',
    days: [] as string[],
    specificDay: null as number | string | null
  };

  weekDays: string[] = ['SU', 'M', 'T', 'W', 'TH', 'F', 'S'];

  customOption: { value: string, display: string } | null = null;

  todayDay: number = new Date().getDate();
  todayDayText: string = `Monthly on day ${this.todayDay}`;
  weekAndDay: string = `${this.currentWeekOfMonth} ${this.currentDayOfWeek}`;
  weekAndDayText: string = `Monthly on the ${this.weekAndDay}`;

  scheduleForm!: FormGroup;
  today!: string;
  subjects: Subject[] = [];
  selectedDayOfWeek!: string;
  formattedDateString!: string;
  schoolYear: SchoolYear[] = [];
  selectedSY: SchoolYear | undefined;

  ngOnInit() {
    this.initForm();
    this.getCurrentDate();
    this.getSubjects();
    this.getProfessors();
    this.updateSelectedDayOfWeek();
    this.getSections();
    this.getLaboratories();
    this.getSchoolYear();
  }

  initForm(): void{
    this.scheduleForm = this.formBuilder.group({
        subject: ['', [Validators.required]],
        section: ['', [Validators.required]],
        startTime: ['', Validators.required],
        endTime: ['', [Validators.required]],
        scheduleDate: ['', [Validators.required]],
        laboratory: ['', [Validators.required]],
        professor: ['', [Validators.required]],
        semester: ['', [Validators.required]],
        remarks: ['', [Validators.required]],
        recurrence: ['', [Validators.required]],
        schoolYear: ['', [Validators.required]]
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

  onSchoolYearChange(event: MatSelectChange){
    const selectedId = Number(event.value)
    this.selectedSY = this.schoolYear.find(s => s.id === selectedId);
    this.setSemester();
  }

  getSections(){
    this.sectionService.getSections().subscribe({
      next: (sections: Section[]) => {
        if(!sections) return;
        this.sections = sections;
      }
    })
  }

  cancelOrAddSchedule(): void {
    this.backToSchedule.emit();
  }


  getSubjects() {
    this.subjectService.getSubjects().subscribe({
      next: subjects => {
        this.subjects = subjects;
      }
    })
  }

  getLaboratories() {
    this.laboratoryService.getLaboratories().subscribe({
      next: (laboratories: Laboratory[]) => {
        if(!laboratories) return;
        this.labs = laboratories;
      }
    })
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Schedule Successfully Added!',
        message: 'Schedule has been set successfully.'
      }
    })

    dialogRef.afterClosed().subscribe(() => {
      this.backToSchedule.emit();
    })
  }

  getProfessors(): void {
    this.userService.getUsersByRole("FACULTY").subscribe({
      next: users => {
        this.professors = users;
      },
      error: error => { console.error(error); }
    })
  }

  getSchoolYear(): void {
    this.schoolYearService.getSchoolYears().subscribe({
      next: (schoolYear: SchoolYear[]) => {
        if(!schoolYear) return;
        this.schoolYear = schoolYear;
      }
    })
  }

  setSemester(){
    this.semesters.push(<Semester>this.selectedSY?.firstSemester);
    this.semesters.push(<Semester>this.selectedSY?.secondSemester);
    this.semesters.push(<Semester>this.selectedSY?.summerSemester);
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
    const selectedProfessor = this.professors.find(professor =>
    professor.id === this.scheduleForm.get('professor')?.value)

    this.scheduleForm.patchValue({
      subject: this.selectedSubject,
      schoolYear: this.selectedSY,
      section: this.sections.find(section =>
        section.id === this.scheduleForm.get('section')?.value),
      semester: this.semesters.find(semesters =>
        semesters.id === this.scheduleForm.get('semester')?.value),
      professor: {
        id: selectedProfessor?.id,
        firstName: selectedProfessor?.firstName,
        lastName: selectedProfessor?.lastName,
        role: selectedProfessor?.role,
      },
      laboratory: this.labs.find(laboratory =>
        laboratory.id !== this.scheduleForm.get('laboratory')?.value),
    })
    let newSchedule = this.scheduleForm.value;

    const startTime = this.scheduleForm.get('startTime')?.value;
    const endTime = this.scheduleForm.get('endTime')?.value;

    newSchedule = {
      ...newSchedule,
      startTime: `${startTime}:00`,
      endTime: `${endTime}:00`,
    }

    this.createSchedule(newSchedule);
  }

  getFullWeekDayName(abbreviation: string): string {
    const weekDaysMap: { [key: string]: string } = {
      'SU': 'Sunday',
      'M': 'Monday',
      'T': 'Tuesday',
      'W': 'Wednesday',
      'TH': 'Thursday',
      'F': 'Friday',
      'S': 'Saturday'
    };
    return weekDaysMap[abbreviation] || abbreviation;
  }



  onDateChange(event: any): void {
    const selectedDate = new Date(event.value);
    const formattedDayOfWeek = this.getDayOfWeek(selectedDate);
    const formattedDate = this.datePipe.transform(selectedDate, 'MM/dd/yy')!;
    this.selectedDayOfWeek = formattedDayOfWeek;
    this.formattedDateString = `${formattedDayOfWeek}, ${formattedDate}`;
    this.scheduleForm.patchValue({
      scheduleDate: this.datePipe.transform(selectedDate, 'yyyy-MM-dd') // raw value for form control
    });
  }

  updateSelectedDayOfWeek() {
    const selectedDate = new Date(this.scheduleForm.get('scheduleDate')?.value);
    this.selectedDayOfWeek = this.getDayOfWeek(selectedDate);
  }

  onRecurrenceChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedRecurrence = selectedValue;

    if (selectedValue === 'custom') {
      this.openCustomModal();
    } else {
      this.previousRecurrence = selectedValue;
      if (selectedValue === 'none') {
        this.customOption = null;
      }
    }
  }

  openCustomModal() {
    this.isCustomRecurrenceVisible = true;
  }

  closeModal() {
    this.isCustomRecurrenceVisible = false;
    this.selectedRecurrence = this.previousRecurrence;
  }

  setCustomRecurrence() {
    const newOptionValue = `custom-${Date.now()}`;
    const newOptionDisplay = this.formatCustomRecurrence();

    this.customOption = { value: newOptionValue, display: newOptionDisplay };

    this.cdr.detectChanges();

    this.selectedRecurrence = newOptionValue;

    this.isCustomRecurrenceVisible = false;
  }

  onRepeatEveryChange(event: Event) {
    this.customRecurrence.repeatEvery =
    parseInt((event.target as HTMLInputElement).value, 10);
  }

  onPeriodChange(event: Event) {
    this.customRecurrence.period = (
      event.target as HTMLSelectElement).value;
  }

  onSpecificDayChange(event: Event) {
    this.customRecurrence.specificDay =
      (event.target as HTMLSelectElement).value;
  }

  toggleDaySelection(day: string) {
    const index = this.customRecurrence.days.indexOf(day);
    if (index === -1) {
      this.customRecurrence.days.push(day);
    } else {
      this.customRecurrence.days.splice(index, 1);
    }

    this.customRecurrence.days.sort((a, b) =>
      this.weekDays.indexOf(a) - this.weekDays.indexOf(b));
  }

  formatCustomRecurrence(): string {
    let formatted = `Every ${this.customRecurrence.repeatEvery}
      ${this.customRecurrence.period}(s)`;
    if (this.customRecurrence.period === 'week') {
      const daysFormatted = this.customRecurrence.days.length > 0
        ? this.customRecurrence.days
            .map(day => this.getFullWeekDayName(day)).join(', ')
        : 'No specific days';
      formatted += ` on ${daysFormatted}`;
    } else if (this.customRecurrence.period === 'month') {
      if (this.customRecurrence.specificDay) {
        if (this.customRecurrence.specificDay === `${this.weekAndDay}`) {
          formatted += ` on the ${this.weekAndDay}`;
        } else {
          formatted += ` on day ${this.customRecurrence.specificDay}`;
        }
      }
    }
    return formatted;
  }

  getDayOfWeek(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
      'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  getFormattedDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions =
      { month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  getWeekOfMonth(date: Date): string {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const weekNumber = Math.ceil((date.getDate() + startOfMonth.getDay()) / 7);
    const weekNames = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
    return weekNames[Math.min(weekNumber - 1, weekNames.length - 1)] || 'Unknown';
  }
}
