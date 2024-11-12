import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { Schedule } from '../../../model/schedule.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ScheduleService } from '../../../services/schedule.service';
import { MatToolbar } from '@angular/material/toolbar';
import { SdkService } from '../../../services/sdk.service';
import { FingerprintService } from '../../../services/fingerprint.service';
import { User } from '../../../model/user.model';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { PromptConfirmComponent } from '../../prompt/prompt-confirm/prompt-confirm.component';
import { PromptOkayComponent } from '../../prompt/prompt-okay/prompt-okay.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgOptimizedImage } from '@angular/common';
import * as faceapi from 'face-api.js';
import { finalize, Subscription } from 'rxjs';
import { RecognitionResponse } from '../../../model/recognition.response.model';
import { FaceRecognitionService } from '../../../services/face.recognition.service';
import { UserService } from '../../../services/user.service';
import { AttendanceService } from '../../../services/attendance.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatProgressBar } from '@angular/material/progress-bar';

@Component({
  selector: 'app-face-recognition-attendance',
  standalone: true,
  imports: [
    MatToolbar,
    MatButton,
    FormsModule,
    MatIconModule,
    NgOptimizedImage,
    MatProgressSpinner,
    MatProgressBar,
  ],
  providers: [
    ScheduleService,
    UserService,
    FingerprintService,
    AttendanceService,
  ],
  templateUrl: './face-recognition-attendance.component.html',
  styleUrls: [
    './face-recognition-attendance.component.css',
    '../start-attendance/start-attendance.component.css',
  ],
})
export class FaceRecognitionAttendanceComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlay') overlay!: ElementRef<HTMLCanvasElement>;
  schedule!: Schedule;
  reminder = 'Scan In-Charge Face ID';
  loggedUser!: User | null;
  hasProfessorVerified = false;
  currentTime!: string;
  currentDate!: string;
  profileImageUrl!: string;
  message = 'WELCOME';
  modelsLoaded = false;
  detectionInterval = 700;
  MAX_NO_FACE_COUNT = 20;
  noFaceDetectedCount = 0;
  lastFaceDetection: faceapi.WithFaceDescriptor<
    faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>
  > | null = null;
  requestSent = 0;
  MAX_REQUEST_SEND = 5;
  matchResponseArray: number[] = [];
  showOtherDetails = false;
  private subscription!: Subscription;
  unrecognized = false;
  studentsLogged: User[] = [];
  private mediaStream: MediaStream | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private scheduleService: ScheduleService,
    private dialog: MatDialog,
    private router: Router,
    private faceRecognitionService: FaceRecognitionService,
    private userService: UserService,
    private fingerprintService: FingerprintService,
    private attendanceService: AttendanceService,
  ) {}

  async ngOnInit() {
    this.updateTimeAndDate();
    setInterval(() => this.updateTimeAndDate(), 1000);
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        const scheduleId = +params.get('id')!;
        this.getScheduleDetails(scheduleId);
        this.loggedUser = this.schedule.professor!;
      },
    });
    await this.loadModels();
  }

  ngAfterViewInit() {
    this.startVideoFeed();
  }

  async loadModels() {
    const MODEL_URL = '/assets/weights';
    try {
      await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
      await faceapi.loadFaceLandmarkTinyModel(MODEL_URL);
      await faceapi.loadFaceRecognitionModel(MODEL_URL);
      this.modelsLoaded = true;
    } catch (err) {
      console.error('Error loading models', err);
    }
  }

  startVideoFeed() {
    const video = this.videoElement.nativeElement;

    navigator.mediaDevices
      .getUserMedia({ video: {} })
      .then((stream) => {
        this.mediaStream = stream;
        video.srcObject = stream;
        video.play().then();
      })
      .catch((err) => console.error('Error accessing a camera', err));

    video.onloadedmetadata = () => {
      this.adjustOverlaySize();
      this.waitForModelsAndStartDetection();
    };
  }

  adjustOverlaySize() {
    const video = this.videoElement.nativeElement;
    const canvas = this.overlay.nativeElement;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  waitForModelsAndStartDetection() {
    if (this.modelsLoaded) {
      this.detectFaces().then();
      this.scheduleFaceDataSend();
    } else {
      setTimeout(() => this.waitForModelsAndStartDetection(), 200);
    }
  }

  async detectFaces() {
    const video = this.videoElement.nativeElement;
    const canvas = this.overlay.nativeElement;
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    const checkForFace = async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptors();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);

      if (resizedDetections.length > 0) {
        this.noFaceDetectedCount = 0;

        const videoCenterX = video.videoWidth / 2;
        const videoCenterY = video.videoHeight / 2;

        let minDistance = Infinity;
        let centerFace: faceapi.WithFaceDescriptor<
          faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>
        > | null = null;

        resizedDetections.forEach((detection) => {
          const box = detection.detection.box;
          const faceCenterX = box.x + box.width / 2;
          const faceCenterY = box.y + box.height / 2;

          const distance = Math.sqrt(
            Math.pow(faceCenterX - videoCenterX, 2) +
              Math.pow(faceCenterY - videoCenterY, 2),
          );

          if (distance < minDistance) {
            minDistance = distance;
            centerFace = detection;
          }
        });

        if (centerFace) {
          const centerFaceDetection = centerFace as faceapi.WithFaceDescriptor<
            faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>
          >;

          const box = centerFaceDetection.detection.box;
          const drawBox = new faceapi.draw.DrawBox(box, {
            label: 'Face Detected',
            boxColor: 'red',
          });

          drawBox.draw(canvas);

          this.lastFaceDetection = centerFaceDetection;
        }
      } else {
        this.noFaceDetectedCount++;
        if (this.noFaceDetectedCount >= this.MAX_NO_FACE_COUNT) {
          this.lastFaceDetection = null;
          this.noFaceDetectedCount = 0;
          this.requestSent = 0;
          this.loggedUser = null;
          this.unrecognized = false;
        }
      }

      // Continue to detect faces in each frame
      requestAnimationFrame(checkForFace);
    };

    await checkForFace();
  }

  scheduleFaceDataSend() {
    setInterval(() => {
      if (this.lastFaceDetection && this.requestSent < this.MAX_REQUEST_SEND) {
        this.requestSent++;
        this.sendFaceData(this.lastFaceDetection);
      }
    }, this.detectionInterval);
  }

  sendFaceData(
    detection: faceapi.WithFaceDescriptor<
      faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>
    >,
  ) {
    const box = detection.detection.box;
    const base64Image = this.getBase64Image(box);

    if (base64Image && this.hasProfessorVerified) {
      this.subscription = this.faceRecognitionService
        .compareFaceData(this.schedule.id, base64Image)
        .subscribe({
          next: (value: RecognitionResponse) => {
            this.matchResponseArray.push(value.match);
            if (this.requestSent === this.MAX_REQUEST_SEND) {
              this.showOtherDetails = true;
              this.getUserDetails(this.getMostFrequentMatch());
              this.unsubscribeFromService();
            }
          },
          error: () => {
            if (this.requestSent === this.MAX_REQUEST_SEND) {
              if (this.matchResponseArray.length === 0) {
                setTimeout(() => {
                  this.unrecognized = true;
                  this.message = 'WELCOME';
                }, 0);
              }
              this.unsubscribeFromService();
            }
          },
        });
    } else if (base64Image && !this.hasProfessorVerified) {
      this.faceRecognitionService
        .verifyProfessor(this.schedule.professor?.id!, base64Image)
        .subscribe({
          next: () => {
            if (this.requestSent === this.MAX_REQUEST_SEND) {
              this.hasProfessorVerified = true;
              this.loggedUser = this.schedule.professor!;
              this.reminder = 'Scan Students Face ID';
            }
          },
          error: () => {
            if (this.requestSent === this.MAX_REQUEST_SEND) {
              if (this.matchResponseArray.length === 0) {
                this.unrecognized = true;
              }
            }
          },
        });
    }
  }

  private logAttendance(
    studentId: number,
    scheduleId: number,
    attendanceStatus: string,
  ) {
    const formData = new FormData();
    formData.append('studentId', studentId.toString());
    formData.append('scheduleId', scheduleId.toString());
    formData.append('attendanceStatus', attendanceStatus);

    this.attendanceService.logAttendance(formData).subscribe({
      next: (value) => {
        this.studentsLogged.push(value);
      },
    });
  }

  private unsubscribeFromService() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getUserDetails(userid: number) {
    this.userService.getUserById(userid).subscribe({
      next: (value) => {
        this.loggedUser = value;
        const hasLogged = this.studentsLogged.some(
          (user) => user.id === value.id,
        );
        if (hasLogged) this.message = 'Already Logged!';
        this.getUserProfileImage(value.id);
        this.logAttendance(value.id, this.schedule.id, 'PRESENT');
      },
    });
  }

  getLoggedStudents() {
    this.attendanceService.getStudentsLogged(this.schedule.id).subscribe({
      next: (value) => {
        this.studentsLogged = value;
      },
    });
  }

  getUserProfileImage(userId: number) {
    this.fingerprintService.getProfileImageUrl(userId).subscribe({
      next: (value: { profileImageUrl: string }) => {
        this.profileImageUrl = value.profileImageUrl;
        this.matchResponseArray = [];
      },
    });
  }

  getMostFrequentMatch() {
    let mostFrequent = this.matchResponseArray[0];
    let maxCount = 1;
    const length = this.matchResponseArray.length;

    for (let i = 0; i < length; i++) {
      let currentCount = 0;

      for (let j = 0; j < length; j++) {
        if (this.matchResponseArray[i] === this.matchResponseArray[j]) {
          currentCount++;
        }
      }

      if (currentCount > maxCount) {
        mostFrequent = this.matchResponseArray[i];
        maxCount = currentCount;
      }
    }

    return mostFrequent;
  }

  getBase64Image(box: faceapi.Box) {
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');

    canvas.width = box.width;
    canvas.height = box.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        video,
        box.x,
        box.y,
        box.width,
        box.height,
        0,
        0,
        box.width,
        box.height,
      );
    }

    return canvas.toDataURL('image/png');
  }

  updateTimeAndDate(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const formattedDate = now.toLocaleDateString('en-US', options);

    const match = formattedDate.match(/^(.*?), (\w+ \d{1,2}, \d{4})$/);
    if (match) {
      const [_, weekday, monthDayYear] = match;
      const [month, day, year] = monthDayYear.split(' ');
      this.currentDate = `${weekday.toUpperCase()}, ${month.charAt(0).toUpperCase()}${month.slice(1).toLowerCase()} ${day} ${year}`;
    } else {
      this.currentDate = formattedDate;
    }
  }

  getScheduleDetails(scheduleId: number) {
    this.scheduleService.getScheduleById(scheduleId).subscribe({
      next: (value) => {
        this.schedule = value;
        this.getLoggedStudents();
      },
    });
  }

  openConfirmationDialog(schedule: Schedule) {
    const ref = this.dialog.open(PromptConfirmComponent, {
      width: '400px',
      data: {
        title: 'Stop Attendance',
        message:
          "Are you sure you want to stop attendance? Students that haven't logged will be marked as absent",
        action: 'Stop',
      },
    });

    ref.afterClosed().subscribe({
      next: () => {
        this.stopAttendance(schedule);
      },
    });
  }

  openInformationDialog(message: string) {
    const ref = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Attendance Stopped',
        message,
      },
    });

    ref.afterClosed().subscribe({
      next: () => {
        this.router.navigate(['/schedule']).then();
      },
    });
  }

  stopAttendance(schedule: Schedule) {
    this.fingerprintService.stopAttendance(schedule).subscribe({
      next: (value) => {
        this.openInformationDialog(value);
      },
    });
  }

  ngOnDestroy() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }
}
