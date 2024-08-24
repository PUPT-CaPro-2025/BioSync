import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-custom-recurrence-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-recurrence-modal.component.html',
  styleUrl: './custom-recurrence-modal.component.css'
})
export class CustomRecurrenceModalComponent {
  @Input() customRecurrence: any;
  @Input() weekDays: string[] = [];
  @Input() todayDay!: number;
  @Input() weekAndDay: string = '';
  @Input() todayDayText: string = '';
  @Input() weekAndDayText: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() repeatEveryChange = new EventEmitter<Event>();
  @Output() periodChange = new EventEmitter<Event>();
  @Output() specificDayChange = new EventEmitter<Event>();
  @Output() dayToggle = new EventEmitter<string>();

  sortedWeekDays(): string[] {
    const weekDaysOrder = ['SU', 'M', 'T', 'W', 'TH', 'F', 'S'];
    return weekDaysOrder.filter(day => this.customRecurrence.days.includes(day));
  }

  onRepeatEveryChange(event: Event) {
    this.repeatEveryChange.emit(event);
  }

  onPeriodChange(event: Event) {
    this.periodChange.emit(event);
  }

  onSpecificDayChange(event: Event) {
    this.specificDayChange.emit(event);
  }

  toggleDaySelection(day: string) {
    this.dayToggle.emit(day);
  }

  closeModal() {
    this.close.emit();
  }

  setCustomRecurrence() {
    this.save.emit();
  }
}
