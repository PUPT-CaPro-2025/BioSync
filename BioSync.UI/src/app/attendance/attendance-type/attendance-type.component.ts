import {Component, OnInit} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-attendance-type',
  standalone: true,
  imports: [MatIconModule, MatToolbarModule],
  templateUrl: './attendance-type.component.html',
  styleUrl: './attendance-type.component.css'
})
export class AttendanceTypeComponent implements OnInit {
  scheduleId = 0

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.scheduleId = +this.route.snapshot.paramMap.get('id')!;
    console.log(this.scheduleId);
  }
}
