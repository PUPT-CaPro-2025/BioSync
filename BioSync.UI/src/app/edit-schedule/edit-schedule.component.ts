import {Component, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatSelectModule} from '@angular/material/select';
import {MatInput} from "@angular/material/input";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import { CommonModule } from '@angular/common';
import {SubjectService} from "../../services/subject.service";
import {Subject} from "../../model/subject-model";
import {AddScheduleService} from "../../services/add-schedule.service";
import {Schedule} from "../../model/schedule-model";
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../prompt-okay/prompt-okay.component";
import {User} from "../../model/user.model";
import {UserService} from "../../services/user.service";
import { CustomRecurrenceModalComponent } from '../custom-recurrence-modal/custom-recurrence-modal.component';

@Component({
  selector: 'app-edit-schedule',
  standalone: true,
  imports: [MatToolbarModule, MatSelectModule, CommonModule, MatInput, ReactiveFormsModule, CustomRecurrenceModalComponent],
  templateUrl: './edit-schedule.component.html',
  styleUrl: './edit-schedule.component.css'
})
export class EditScheduleComponent {
  constructor(
    private cdr: ChangeDetectorRef
  ) {}

  @Output() editBackToSchedule = new EventEmitter<void>();

  cancelOrEditSchedule(): void {
    this.editBackToSchedule.emit();
  }

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
    '2nd Semster',
    'Summer'
  ];

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

  customOption: { value: string, display: string } | null = null;

  todayDay: number = new Date().getDate();
  todayDayText: string = `Monthly on day ${this.todayDay}`;
  weekAndDay: string = `${this.currentWeekOfMonth} ${this.currentDayOfWeek}`;
  weekAndDayText: string = `Monthly on the ${this.weekAndDay}`;

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
