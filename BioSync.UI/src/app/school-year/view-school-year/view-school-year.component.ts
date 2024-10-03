import {Component, Output, EventEmitter, Input } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-view-school-year',
  standalone: true,
  imports: [MatToolbarModule, MatSelectModule],
  templateUrl: './view-school-year.component.html',
  styleUrl: './view-school-year.component.css'
})
export class ViewSchoolYearComponent {
  @Output() backToViewSchoolYear = new EventEmitter<void>();
  @Input() id!: number | undefined;

  yearStart: string = "2024";
  yearEnd: string =  "2025";
  oneStartDate: string = "September 10, 2024";
  oneEndDate: string = "January 24, 2025";
  twoStartDate: string = "February 12, 2025";
  twoEndDate: string = "June 30, 2025";
  summerStartDate: string = "July 14, 2025";
  summerEndDate: string = " September 1, 2025";

  returnToSchoolYearView(): void {
    this.backToViewSchoolYear.emit();
  }
}
