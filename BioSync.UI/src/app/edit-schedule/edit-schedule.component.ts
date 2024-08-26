import {Component, Output, EventEmitter, ChangeDetectorRef, Input, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatSelectChange, MatSelectModule} from '@angular/material/select';
import {MatInput} from "@angular/material/input";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule, DatePipe} from '@angular/common';
import { CustomRecurrenceModalComponent } from '../custom-recurrence-modal/custom-recurrence-modal.component';
import {Schedule} from "../../model/schedule.model";
import {Section} from "../../model/section.model";
import {Laboratory} from "../../model/laboratory.model";
import {User} from "../../model/user.model";
import {Semester} from "../../model/semester.model";
import {SectionService} from "../../services/section.service";
import {MatDatepicker, MatDatepickerInput, MatDatepickerInputEvent} from "@angular/material/datepicker";
import {MatIcon} from "@angular/material/icon";
import {provideNativeDateAdapter} from "@angular/material/core";
import {LaboratoryService} from "../../services/laboratory.service";
import {UserService} from "../../services/user.service";
import {SchoolYear} from "../../model/school.year.model";
import {SchoolYearService} from "../../services/school.year.service";
import {ScheduleService} from "../../services/schedule.service";
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../prompt-okay/prompt-okay.component";

@Component({
  selector: 'app-edit-schedule',
  standalone: true,
  imports: [MatToolbarModule, MatSelectModule, CommonModule, MatInput, ReactiveFormsModule, CustomRecurrenceModalComponent, MatDatepicker, MatDatepickerInput, MatIcon],
  providers: [
    SectionService,
    DatePipe,
    provideNativeDateAdapter(),
    LaboratoryService,
    UserService,
    SchoolYearService,
    ScheduleService,
  ],
  templateUrl: './edit-schedule.component.html',
  styleUrl: './edit-schedule.component.css'
})
export class EditScheduleComponent implements OnInit{


  @Output() editBackToSchedule = new EventEmitter<void>();
  @Output() editedSchedule = new EventEmitter<Schedule>();
  @Input() scheduleToEdit!: Schedule;

  editScheduleForm!: FormGroup;
  sections: Section[] = [];
  labs: Laboratory[] = [];
  professors: User[] = [];
  semesters: Semester[] = [];
  schoolYear: SchoolYear[] = [];
  formattedDateString!: string;
  today!: string;
  selectedSY = this.scheduleToEdit?.schoolYear;
  selectedDayOfWeek!: string;

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

  constructor(
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private sectionService: SectionService,
    private datePipe: DatePipe,
    private laboratoryService: LaboratoryService,
    private userService: UserService,
    private schoolYearService: SchoolYearService,
    private scheduleService: ScheduleService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getCurrentDate();
    this.initScheduleDate(this.scheduleToEdit.scheduleDate);
    this.getSections();
    this.getLaboratories();
    this.getProfessors();
    this.getSchoolYear();
    this.initSemester();
    this.setFormValues();
  }

  initForm(): void{
    this.editScheduleForm = this.formBuilder.group({
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

  setFormValues(){
    this.editScheduleForm.patchValue({
      section: this.scheduleToEdit.section?.id,
      startTime: this.scheduleToEdit.startTime.substring(0,5),
      endTime: this.scheduleToEdit.endTime.substring(0,5),
      scheduleDate: this.scheduleToEdit.scheduleDate,
      laboratory: this.scheduleToEdit.laboratory?.id,
      professor: this.scheduleToEdit.professor?.id,
      schoolYear: this.scheduleToEdit.schoolYear?.id,
      semester: this.scheduleToEdit.semester?.id,
      remarks: this.scheduleToEdit.remarks,
      recurrence: ''
    })
  }

  submit(){
    const selectedProfessor = this.professors.find(professor =>
      professor.id === this.editScheduleForm.get('professor')?.value)

    this.editScheduleForm.patchValue({
      schoolYear: this.selectedSY,
      section: this.sections.find(section =>
        section.id === this.editScheduleForm.get('section')?.value),
      semester: this.semesters.find(semesters =>
        semesters.id === this.editScheduleForm.get('semester')?.value),
      professor: {
        id: selectedProfessor?.id,
        firstName: selectedProfessor?.firstName,
        lastName: selectedProfessor?.lastName,
        role: selectedProfessor?.role,
      },
      laboratory: this.labs.find(laboratory =>
        laboratory.id === this.editScheduleForm.get('laboratory')?.value),
    })

    let newSchedule = this.editScheduleForm.value;

    const startTime = this.editScheduleForm.get('startTime')?.value;
    const endTime = this.editScheduleForm.get('endTime')?.value;

    newSchedule = {
      ...newSchedule,
      subject: this.scheduleToEdit.subject,
      startTime: `${startTime}:00`,
      endTime: `${endTime}:00`,
      id: this.scheduleToEdit.id
    }

    this.updateSchedule(newSchedule);
  }

  getSections(){
    this.sectionService.getSections().subscribe({
      next: (sections: Section[]) => {
        if(!sections) return;
        this.sections = sections;
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

  private initSemester() {
    this.selectedSY = this.scheduleToEdit?.schoolYear;
    if (this.selectedSY) {
      this.setSemester()
    }
  }

  onSchoolYearChange(event: MatSelectChange){
    const selectedId = Number(event.value)
    this.selectedSY = this.schoolYear.find(s => s.id === selectedId);
    this.setSemester();
  }

  setSemester(){
    this.semesters.push(<Semester>this.selectedSY?.firstSemester);
    this.semesters.push(<Semester>this.selectedSY?.secondSemester);
    this.semesters.push(<Semester>this.selectedSY?.summerSemester);
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

  getCurrentDate () {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    this.today = `${year}-${month}-${day}`;
  }

  onDateChange(event: MatDatepickerInputEvent<Date>): void {
    const selectedDate = event.value;
    const formattedDayOfWeek = this.getDayOfWeek(selectedDate!);
    const formattedDate = this.datePipe.transform(selectedDate, 'MM/dd/yy')!;
    this.selectedDayOfWeek = formattedDayOfWeek;
    this.formattedDateString = `${formattedDayOfWeek}, ${formattedDate}`;
    this.editScheduleForm.patchValue({
      scheduleDate: this.datePipe.transform(selectedDate, 'yyyy-MM-dd') // raw value for form control
    });
  }

  initScheduleDate(selectedDate: string): void {
    const date = new Date(selectedDate);
    const formattedDayOfWeek = this.getDayOfWeek(date);
    const formattedDate = this.datePipe.transform(date, 'MM/dd/yy')!;
    this.selectedDayOfWeek = formattedDayOfWeek;
    this.formattedDateString = `${formattedDayOfWeek}, ${formattedDate}`;
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

  cancelOrEditSchedule(): void {
    this.editBackToSchedule.emit();
  }

  updateSchedule(schedule: Schedule) {
    this.scheduleService.updateSchedule(schedule).subscribe({
      next: updatedSchedule => {
        if(updatedSchedule.id !== this.scheduleToEdit.id) return;
        this.editedSchedule.emit(updatedSchedule);
        this.openSuccessDialog();
      }
    })
  }

  openSuccessDialog(){
    const ref = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Schedule Updated!',
        message: 'Schedule details has been updated successfully.'
      }
    })

    ref.afterClosed().subscribe({
      next: () => {
        this.cancelOrEditSchedule();
      }
    })
  }

}
