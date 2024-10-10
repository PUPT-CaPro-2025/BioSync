import {Component, OnInit} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-start-attendance-face',
  standalone: true,
  imports: [
    MatIcon,
    MatProgressSpinner
  ],
  templateUrl: './start-attendance-face.component.html',
  styleUrl: './start-attendance-face.component.css'
})
export class StartAttendanceFaceComponent implements OnInit{
  schedule: any = {
    id: 1,
    startTime: '10:00AM',
    endTime: '3:00AM',
    scheduleDate: 'January 8, 2025',
    laboratory:  'DOST Laboratory',
    professor: 'Jhean Professor',
    semester: 'First Semester',
    schoolYear: '2024 - 2025',
    remarks: 'Laboratory',
    subject: 'Computer Programming 3',
  }
  message = "WELCOME";
  student_code = "2021-00172-TG-0";
  name = "Jhean Khendrick C. Galope";
  recognized = false;
  loading = false;
  submitted = false;

  ngOnInit() {
    this.initializeCamera().then()
  }

  async initializeCamera() {
    const video = document.getElementById('videoElement') as HTMLVideoElement;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (video) {
          video.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('error accessing media devides', err);
      });
  }
}
