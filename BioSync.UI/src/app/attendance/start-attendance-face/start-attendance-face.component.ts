import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import * as faceapi from 'face-api.js';
import { Schedule } from '../../../model/schedule.model';
import { FaceRecognitionService } from '../../../services/face.recognition.service';
import {UserService} from "../../../services/user.service";
import {RecognitionResponse} from "../../../model/recognition.response.model";
import { CookieService } from '../../../services/cookie.service';
import { FingerprintService } from '../../../services/fingerprint.service';
import {finalize, Subscription} from "rxjs";
import {AttendanceService} from "../../../services/attendance.service";

@Component({
  selector: 'app-start-attendance-face',
  standalone: true,
  imports: [MatIcon, MatProgressSpinner],
  providers: [UserService],
  templateUrl: './start-attendance-face.component.html',
  styleUrl: './start-attendance-face.component.css',
})
export class StartAttendanceFaceComponent implements OnInit {
  @Input() schedulee!: Schedule;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlay') overlay!: ElementRef<HTMLCanvasElement>;
  profileImageUrl!: string;
  hasError = false;
  schedule_id = 1;
  schedule: any = {
    id: 1,
    startTime: '10:00AM',
    endTime: '3:00AM',
    scheduleDate: 'January 8, 2025',
    laboratory: 'DOST Laboratory',
    professor: 'Jhean Professor',
    semester: 'First Semester',
    schoolYear: '2024 - 2025',
    remarks: 'Laboratory',
    subject: 'Computer Programming 3',
  };
  message = 'WELCOME';
  student_code = '2021-00172-TG-0';
  name = 'Jhean Khendrick C. Galope';
  recognized = false;
  loading = false;
  submitted = false;
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
  private subscription!: Subscription;

  constructor(
    private faceRecognitionService: FaceRecognitionService,
    private userService: UserService,
    private cookieService: CookieService,
    private fingerprintService: FingerprintService,
    private attendanceService: AttendanceService,
  ) {}

  async ngOnInit() {
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

  //test only
    this.cookieService.setCookie(
      'authToken',
      'eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiIyMDIxLVRFU1QtMCIsImlhdCI6MTcyODQ0NzE0OCwiZXhwIjoxNzI5MDUxOTQ4fQ.wouDKGlp_OOJTniGu2EFFcoxfWQMzlFxy7mNrVMxqepcQKw8piajSAlwD_PXj6vu'
    );
  }

  startVideoFeed() {
    const video = this.videoElement.nativeElement;

    navigator.mediaDevices
      .getUserMedia({ video: {} })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
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
              Math.pow(faceCenterY - videoCenterY, 2)
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
          this.recognized = false;
          this.hasError = false;
          this.loading = false;
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
    >
  ) {
    const box = detection.detection.box;
    const base64Image = this.getBase64Image(box);

    if (base64Image) {
      this.subscription = this.faceRecognitionService
        .compareFaceData(this.schedule_id, base64Image)
        .pipe(
          finalize(() => {
            this.submitted = true;
            this.loading = true;
          })
        )
        .subscribe({
          next: (value: RecognitionResponse) => {
            this.matchResponseArray.push(value.match);
            if (this.requestSent === this.MAX_REQUEST_SEND) {
              this.getUserDetails(this.getMostFrequentMatch());
              this.unsubscribeFromService()
            }

            //TODO: LOG ATTENDANCE FOR THAT VALUE ID
          },
          error: (err) => {
            if (this.requestSent === this.MAX_REQUEST_SEND) {
              if(this.matchResponseArray.length === 0){
                setTimeout(() => {
                  this.hasError = true;
                  this.recognized = false;
                  this.loading = false;
                  this.submitted = false;
                }, 0);
              }
              this.unsubscribeFromService()
            }
          }
        });
    }
  }

  private logAttendance(studentId: number, scheduleId: number, attendanceStatus: string){
    const formData = new FormData();
    formData.append('studentId', studentId.toString());
    formData.append('scheduleId', scheduleId.toString());
    formData.append('attendanceStatus', attendanceStatus);

    this.attendanceService.logAttendance(formData).subscribe();
  }

  private unsubscribeFromService() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getUserDetails(userid: number) {
    this.userService.getUserById(userid).subscribe({
      next: (value) => {
        this.name = `${value.firstName} ${value.lastName}`;
        this.student_code = value.usercode;
        this.getUserProfileImage(value.id);
        this.logAttendance(value.id, this.schedule_id, "PRESENT");
      },
    });
  }

  getUserProfileImage(userId: number) {
    this.fingerprintService.getProfileImageUrl(userId).subscribe({
      next: (value: { profileImageUrl: string }) => {
        this.profileImageUrl = value.profileImageUrl;
        this.matchResponseArray = []
        this.recognized = true;
        this.loading = false;
        this.submitted = false;
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
        box.height
      );
    }

    return canvas.toDataURL('image/png');
  }
}
