import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-attendance-type',
  standalone: true,
  imports: [MatIconModule, MatToolbarModule],
  templateUrl: './attendance-type.component.html',
  styleUrl: './attendance-type.component.css'
})
export class AttendanceTypeComponent {

}
