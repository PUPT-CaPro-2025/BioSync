import { Component, Output, EventEmitter } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatSelectModule} from '@angular/material/select';

@Component({
  selector: 'app-add-schedule',
  standalone: true,
  imports: [MatToolbarModule, MatSelectModule],
  templateUrl: './add-schedule.component.html',
  styleUrl: './add-schedule.component.css'
})
export class AddScheduleComponent {
  @Output() backToSchedule = new EventEmitter<void>();

  cancelOrAddSchedule(): void {
    this.backToSchedule.emit();
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
}
