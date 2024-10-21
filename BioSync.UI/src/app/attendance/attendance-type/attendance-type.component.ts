import {Component, OnInit} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {ActivatedRoute, Router} from "@angular/router";
import {ScheduleService} from "../../../services/schedule.service";
import {Subject} from "../../../model/subject-model";

@Component({
    selector: 'app-attendance-type',
    standalone: true,
    imports: [MatIconModule, MatToolbarModule],
    providers: [ScheduleService],
    templateUrl: './attendance-type.component.html',
    styleUrl: './attendance-type.component.css'
})
export class AttendanceTypeComponent implements OnInit {
    scheduleId = 0
    selectedSubject!: Subject

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private scheduleService: ScheduleService
    ) {}

    ngOnInit() {
        this.scheduleId = +this.route.snapshot.paramMap.get('id')!;
        this.getScheduleDetails(this.scheduleId);
    }

    getScheduleDetails(scheduleId: number) {
        this.scheduleService.getScheduleById(scheduleId).subscribe({
            next: (value) => {
                this.selectedSubject = value.subject!
            },
        });
    }

    startAttendance(type: string) {
        this.router.navigate(
            [`attendance/${type}/start/`, this.scheduleId]).then();
    }
}
