import { Component } from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";

@Component({
  selector: 'app-view-schedule',
  standalone: true,
    imports: [
        MatToolbar
    ],
  templateUrl: './view-schedule.component.html',
  styleUrl: './view-schedule.component.css'
})
export class ViewScheduleComponent {

  returnToSchoolYearView() {

  }
}
