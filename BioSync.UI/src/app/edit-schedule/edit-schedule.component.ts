import { Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-edit-schedule',
  standalone: true,
  imports: [MatToolbarModule, MatSelectModule],
  templateUrl: './edit-schedule.component.html',
  styleUrl: './edit-schedule.component.css'
})
export class EditScheduleComponent {
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
