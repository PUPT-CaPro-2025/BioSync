import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import * as faceapi from 'face-api.js';
import { Schedule } from '../../../model/schedule.model';
import { FaceRecognitionService } from '../../../services/face.recognition.service';

@Component({
  selector: 'app-start-attendance-face',
  standalone: true,
  imports: [MatIcon, MatProgressSpinner],
  templateUrl: './start-attendance-face.component.html',
  styleUrl: './start-attendance-face.component.css',
})
export class StartAttendanceFaceComponent implements OnInit {
  @Input() schedulee!: Schedule;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlay') overlay!: ElementRef<HTMLCanvasElement>;
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
  detectionInterval = 5000;
  MAX_NO_FACE_COUNT = 20;
  noFaceDetectedCount = 0;
  lastFaceDetection: faceapi.WithFaceDescriptor<
    faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>
  > | null = null;

  constructor(private faceRecognitionService: FaceRecognitionService) {}

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
      this.detectFaces();
      this.scheduleFaceDataSend();
    } else {
      setTimeout(() => this.waitForModelsAndStartDetection(), 200);
    }
  }

  // Continuously detect faces and draw red boxes
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

          // Update lastFaceDetection with the full detection object
          this.lastFaceDetection = centerFaceDetection;
        }
      } else {
        this.noFaceDetectedCount++;
        if (this.noFaceDetectedCount >= this.MAX_NO_FACE_COUNT) {
          console.log('No face detected'); // Log when no face is detected
          this.lastFaceDetection = null; // Reset if no face detected for MAX_NO_FACE_COUNT
          this.noFaceDetectedCount = 0;
        }
      }

      // Continue to detect faces in each frame
      requestAnimationFrame(checkForFace);
    };

    checkForFace();
  }

  // Function to send face data every detectionInterval (1 second)
  scheduleFaceDataSend() {
    setInterval(() => {
      // Send face data only if a face has been detected
      if (this.lastFaceDetection) {
        this.sendFaceData(this.lastFaceDetection);
      } else {
        console.log('No face detected, skipping face data send'); // Log when no face data is sent
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
      this.faceRecognitionService
        .compareFaceData(this.schedule_id, base64Image)
        .subscribe({
          next: (value) => {
            console.log(value)

            //TODO: GET VALUE ID 
            //TODO: DISPLAY USER DETAILS
            //TODO: LOG ATTENDANCE FOR THAT VALUE ID
          },
          error: (err) => console.error('something went wrong', err),
        });
    }
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
