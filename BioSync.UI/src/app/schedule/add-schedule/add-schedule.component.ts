import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSelectChange, MatSelectModule} from '@angular/material/select';
import {MatInput} from "@angular/material/input";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule, DatePipe} from '@angular/common';
import {SubjectService} from "../../../services/subject.service";
import {Subject} from "../../../model/subject-model";
import {AddScheduleService} from "../../../services/add-schedule.service";
import {Schedule} from "../../../model/schedule.model";
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../../prompt/prompt-okay/prompt-okay.component";
import {User} from "../../../model/user.model";
import {UserService} from "../../../services/user.service";
import {MatDatepicker, MatDatepickerInput} from "@angular/material/datepicker";
import {MatButton} from "@angular/material/button";
import {provideNativeDateAdapter} from "@angular/material/core";
import {MatIcon} from "@angular/material/icon";
import {SectionService} from "../../../services/section.service";
import {Section} from "../../../model/section.model";
import {SchoolYearService} from "../../../services/school.year.service";
import {SchoolYear} from "../../../model/school.year.model";
import {Semester} from "../../../model/semester.model";
import {Laboratory} from "../../../model/laboratory.model";
import {LaboratoryService} from "../../../services/laboratory.service";
import {catchError, debounceTime, of, switchMap} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {MatCardTitle} from "@angular/material/card";
import {ScheduleService} from "../../../services/schedule.service";
import {CryptoService} from "../../../services/crypto.service";
import {CookieService} from "../../../services/cookie.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-add-schedule',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatSelectModule,
    CommonModule,
    MatInput,
    ReactiveFormsModule,
    MatDatepicker,
    MatDatepickerInput,
    MatButton,
    MatIcon,
    MatCardTitle
  ],
  providers: [
    SubjectService,
    AddScheduleService,
    UserService,
    provideNativeDateAdapter(),
    DatePipe,
    SectionService,
    SchoolYearService,
    LaboratoryService,
    ScheduleService
  ],
  templateUrl: './add-schedule.component.html',
  styleUrl: './add-schedule.component.css'
})
export class  AddScheduleComponent implements OnInit{
  @Input() isOneSchedule!: boolean;
  @Input() isWeeklySchedule!: boolean;
  @Input() isRequest!: boolean;
  @Output() backToSchedule = new EventEmitter<void>();
  @Output() createdSchedule = new EventEmitter<Schedule[]>();

  selectedSubject!: Subject | undefined;

  sections: Section[] = [];

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
  isCustomRecurrenceVisible = false;

  customRecurrence = {
    repeatEvery: 1,
    period: 'day',
    days: [] as string[],
    specificDay: null as number | string | null
  };

  weekDays: string[] = ['SU', 'M', 'T', 'W', 'TH', 'F', 'S'];

  customOption: { value: string, display: string } | null = null;

  scheduleForm!: FormGroup;
  today!: string;
  subjects: Subject[] = [];
  selectedDayOfWeek!: string;
  formattedDateString!: string;
  schoolYear: SchoolYear[] = [];
  selectedSY: SchoolYear | undefined;
  isScheduleValid = false;
  showConflictAlert = false;
  conflictSchedule!: Schedule[];

  constructor(
    private formBuilder: FormBuilder,
    private subjectService: SubjectService,
    private addScheduleService: AddScheduleService,
    private dialog: MatDialog,
    private userService: UserService,
    private datePipe: DatePipe,
    private sectionService: SectionService,
    private schoolYearService: SchoolYearService,
    private scheduleService: ScheduleService,
    private laboratoryService: LaboratoryService,
    private cryptoService: CryptoService,
    private cookieService: CookieService,
    private router: Router,
  ) {}

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
        recurrence: [this.isWeeklySchedule ? 'WEEKLY' : 'NONE', [Validators.required]],
        schoolYear: ['', [Validators.required]]
      }
    )

    this.handleFormChanges();
  }

  handleFormChanges(): void {
    this.scheduleForm.valueChanges
      .pipe(
        debounceTime(500),
        switchMap(formValues => {
          if (this.isWeeklySchedule && formValues.schoolYear && formValues.semester) {
            const dayValues: string[] = this.customRecurrence.days.map(day => this.getDayAbbreviation(day));

            if (dayValues.length === 0) {
              return of([]);
            }

            const scheduleDay: Date = this.getScheduleDay(dayValues);

            if (isNaN(scheduleDay.getTime())) {
              return of([]);
            }

            formValues.scheduleDate = this.convertToISOFormat(scheduleDay.toString())?.split('T')[0];

            this.scheduleForm.patchValue({
              scheduleDate: this.convertToISOFormat(scheduleDay.toString())?.split('T')[0],
            })
          }

          if (this.isFormValid(formValues)) {
            this.prepareFormValues(formValues);
            return this.addScheduleService.detectConflict(formValues);
          } else {
            return of([]);
          }
        })
      )
      .subscribe({
        next: value => {
          if(value.length !== 0) {
            this.conflictSchedule = value;
            this.showConflictAlert = true;
            console.log(this.conflictSchedule);
            this.isScheduleValid = false;
          } else {
              this.isScheduleValid = this.areAllControlsValid(this.scheduleForm);
              this.showConflictAlert = false;
          }
        }
      });
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
    this.isOneSchedule = false;
    this.isWeeklySchedule = false;
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
        title: this.isRequest? 'Request Submitted' : 'Schedule Successfully Added!',
        message: this.isRequest ? 'Request submitted successfully' : 'Schedule has been set successfully.'
      }
    })

    dialogRef.afterClosed().subscribe(() => {
      this.isRequest ? this.toPendingSchedules() : this.backToSchedule.emit();
    })
  }

  getProfessors(): void {
    this.userService.getUsersByRole("FACULTY").subscribe({
      next: users => {
        if(!this.isRequest){
          this.professors = users;
        } else {
          this.getCurrentProfessor()
        }
      },
      error: error => { console.error(error); }
    })
  }

  getCurrentProfessor(){
    let user = this.userService.getUserById(this.getUserId());
    user.subscribe({
      next: (user: User) => {
        this.professors.push(user);
      }
    })

    this.scheduleForm.patchValue({
      professor: this.getUserId()
    })
  }

  getUserId(){
    const encryptedUserId = decodeURIComponent(this.cookieService.getCookie("user_id")!);
    return +this.cryptoService.decrypt(encryptedUserId);
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

  createSchedule(schedule: Schedule[]){
    return this.addScheduleService
      .createSchedule(schedule)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if(error.status === 409){
            this.openSomethingWentWrong();
          }

          return of(null)
        })
      )
      .subscribe({
        next: createdSchedule => {
          if(createdSchedule){
            this.openDialog()
            this.createdSchedule.emit(createdSchedule)
          }
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
        laboratory.id === this.scheduleForm.get('laboratory')?.value),
    })
    let newSchedule = this.scheduleForm.value;

    const startTime = this.scheduleForm.get('startTime')?.value;
    const endTime = this.scheduleForm.get('endTime')?.value;

    let dayValues: string[] = [];

    this.customRecurrence.days.forEach(day => {
      dayValues.push(this.getDayAbbreviation(day));
    });
    let scheduleDay = this.getScheduleDay(dayValues);

    newSchedule = {
      ...newSchedule,
      startTime: `${startTime}:00`,
      endTime: `${endTime}:00`,
      status: this.isRequest ? 'PENDING' : 'APPROVED',
      requester: this.isRequest ?  {
        id: selectedProfessor?.id,
        firstName: selectedProfessor?.firstName,
        lastName: selectedProfessor?.lastName,
        role: selectedProfessor?.role,
      } : null,
    }

    if(this.scheduleForm.get('recurrence')?.value === "NONE"){
      newSchedule = {
        ...newSchedule,
        recurrenceDays:  [],
        recurrenceInterval: 0
      }
    } else if(this.scheduleForm.get('recurrence')?.value === "WEEKLY"){
      newSchedule = {
        ...newSchedule,
        recurrenceDays: dayValues,
        recurrenceInterval: 0,
        scheduleDate: this.convertToISOFormat(scheduleDay.toString())?.split('T')[0]
      }
    }

    this.createSchedule(newSchedule);
  }


  openSomethingWentWrong(){
    const ref = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Something Went Wrong!',
        message: 'Schedule conflict detected.'
      }
    })

    ref.afterClosed().subscribe({
      next: () => {
        this.cancelOrAddSchedule();
      }
    })
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

  getTime12HourFormat(time: string) {
    return this.scheduleService.getTime12HourFormat(time);
  }

  updateSelectedDayOfWeek() {
    const selectedDate = new Date(this.scheduleForm.get('scheduleDate')?.value);
    this.selectedDayOfWeek = this.getDayOfWeek(selectedDate);
  }

  onRecurrenceChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedRecurrence = selectedValue;

    if (selectedValue === '') {
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

  getDayAbbreviation(day: string): string {
    switch (day.toUpperCase()) {
      case 'M': return 'MON';
      case 'T': return 'TUE';
      case 'W': return 'WED';
      case 'TH': return 'THU';
      case 'F': return 'FRI';
      case 'S': return 'SAT';
      case 'SU': return 'SUN';
      default: return 'Invalid day';
    }
  }

  convertToISOFormat(dateString: string) {
    const dateObject = new Date(dateString);
    return dateObject.toISOString().replace('Z', '+08:00');
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

  private getScheduleDay(dayValues: string[]) {
    const selectedDay = dayValues[0];
    const currentDate = new Date();
    const currentDayIndex = currentDate.getDay();
    const dayIndexMap: { [key: string]: number } = {
      MON: 1,
      TUE: 2,
      WED: 3,
      THU: 4,
      FRI: 5,
      SAT: 6,
      SUN: 0
    };

    const selectedDayIndex = dayIndexMap[selectedDay];

    let scheduleDay: Date;

    if (selectedDayIndex === currentDayIndex) {
      scheduleDay = currentDate;
    } else {
      let daysUntilNext = (selectedDayIndex - currentDayIndex + 7) % 7;
      if (daysUntilNext > 0) {
        scheduleDay = new Date(currentDate);
        scheduleDay.setDate(currentDate.getDate() + daysUntilNext);
      } else {
        scheduleDay = new Date(currentDate);
        scheduleDay.setDate(currentDate.getDate() + (7 + daysUntilNext));
      }
    }
    return scheduleDay;
  }

  private isFormValid(formValues: Partial<Schedule>): "" | undefined | Laboratory {
    return (
      formValues.scheduleDate &&
      formValues.startTime &&
      formValues.endTime &&
      formValues.laboratory
    );
  }

  private prepareFormValues(formValues: any): void {
    formValues.subject = null;
    formValues.section = null;
    formValues.professor = null;
    formValues.remarks = null;
    formValues.semester = null;
    formValues.schoolYear = null;
    formValues.startTime = `${formValues.startTime}:00`;
    formValues.endTime = `${formValues.endTime}:00`;
    formValues.laboratory = this.labs.find(laboratory => laboratory.id === formValues.laboratory);
  }

  private areAllControlsValid(form: FormGroup): boolean {
    return Object.values(form.controls).every(control => control.valid);
  }

  private toPendingSchedules() {
    this.router.navigate(['/my-requests']).then();
  }

}
