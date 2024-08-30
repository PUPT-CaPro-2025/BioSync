import {Component, Output, EventEmitter, Input, OnInit,} from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-view-program',
  standalone: true,
  imports: [MatToolbarModule, MatSelectModule],
  templateUrl: './view-program.component.html',
  styleUrl: './view-program.component.css'
})
export class ViewProgramComponent {
  program: string = "BSIT";
  year: string =  "3";
  section: string = "1";
  description: string = "Bachelor of Science in Information Technology.";
}
