import { Component, Output, EventEmitter, } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';

interface ScheduleSection {
  section: string;
  start_time: string;
  end_time: string;
  schedule_date: string;
  laboratory: string;
  professor: string;
  semester: string;
  start_year: string;
  end_year: string;
  remark: string;
}

@Component({
  selector: 'app-view-schedule',
  standalone: true,
  imports: [MatToolbarModule, MatSelectModule],
  templateUrl: './view-schedule.component.html',
  styleUrl: './view-schedule.component.css'
})
export class ViewScheduleComponent {
  @Output() viewBackToSchedule = new EventEmitter<void>();

  backToSchedule(): void {
    this.viewBackToSchedule.emit();
  }

  schedule: ScheduleSection = {
     section: "BSIT 3-1", 
     start_time: "7:30 AM", 
     end_time: "10:30AM", 
     schedule_date: "09/08/2024", 
     laboratory: "DOST Laboratory", 
     professor: "Gecilie Almirañez", 
     semester: "Summer", 
     start_year: "2023", 
     end_year: "2024", 
     remark: "laboratory",
  }
}
