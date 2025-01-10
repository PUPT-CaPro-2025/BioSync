import {Component, Output, EventEmitter, OnInit, ViewEncapsulation, ViewChild, OnDestroy} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import {UserService} from "../../../services/user.service";
import {User} from "../../../model/user.model";
import {PromptOkayComponent} from "../../prompt/prompt-okay/prompt-okay.component";
import {MatDialog} from "@angular/material/dialog";
import {StepperSelectionEvent} from "@angular/cdk/stepper";
import {MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious} from "@angular/material/stepper";
import {SdkService} from "../../../services/sdk.service";
import {FingerprintService} from "../../../services/fingerprint.service";
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import {MailService} from "../../../services/mail.service";
import {
  FaceRecognitionService
} from "../../../services/face.recognition.service";
import {Suffix} from "../../../model/suffix.model";
import {SuffixService} from "../../../services/suffix.service";

@Component({
  selector: 'app-add-professor',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
    MatStep,
    MatStepper,
    MatStepLabel,
    MatStepperNext,
    MatStepperPrevious,
    MatIconModule,
    CommonModule
  ],
  providers: [UserService, SdkService, FingerprintService, MailService, SuffixService],
  templateUrl: './add-professor.component.html',
  styleUrls: ['./add-professor.component.css', '../../student/add-student/add-student.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AddProfessorComponent implements OnInit, OnDestroy{
  @Output() backToProfessor = new EventEmitter<void>();
  @Output() professorAdded = new EventEmitter<User>();
  @ViewChild('videoElement') videoElementRef!: any;
  private stream: MediaStream | null = null;

  allSuffix: Suffix[] = [];
  professorForm!: FormGroup;
  currentStepLabel: string = 'Set Up Information';
  imageForm!: FormGroup;
  selectedProfileImage!: Blob;
  imageSrc: string | ArrayBuffer | null = null;
  rightThumbFingerprintImageSrc: Blob | null = null;
  rightIndexFingerprintImageSrc: Blob | null = null;
  rightThumbState = 'Scan Left Index';
  hasRightThumb = false;
  isRightThumb = false;
  rightIndexState = 'Scan Right Index';
  isRightIndex = false;
  imageButtonLabel = 'Skip';
  disableReset = false;

  videoElement!: HTMLVideoElement;
  isCameraOpen = false;
  captureButtonLabel = 'Take Photo';

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private dialog: MatDialog,
    private sdkService: SdkService,
    private fingerprintService: FingerprintService,
    private mailService: MailService,
    private faceRecognitionService: FaceRecognitionService,
    private suffixService: SuffixService
  ) {}

  ngOnInit() {
    this.initForm();
    this.getSuffixes();
    this.sdkService.loadSDK();

    this.sdkService.getImageSrc().subscribe({
      next: (src) => {
        if (src) {
          if(this.rightThumbFingerprintImageSrc == null){
            this.rightThumbFingerprintImageSrc = this.base64ToBlob(src, 'image/png');
            this.isRightThumb = true;
            this.disableReset = true;
            setTimeout(() => {
              this.rightThumbState = 'Left Index Captured';
              this.hasRightThumb = true;
              this.disableReset = false;
            }, 2000);
          } else {
            this.rightIndexFingerprintImageSrc = this.base64ToBlob(src, 'image/png');
            this.isRightIndex = true;
            this.rightIndexState = 'Right Index Captured';
          }
        }
      }
    });
  }

  getSuffixes(){
    this.suffixService.getSuffixes().subscribe({
      next: suffixes => {
        this.allSuffix = suffixes;
      }
    })
  }

  initForm(){
    this.professorForm = this.formBuilder.group({
      usercode: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      middleName: [''],
      suffix: ['', [Validators.required]],
    });

    this.imageForm = this.formBuilder.group({
      profileImage: [null, Validators.required]
    })
  }

  cancelAddProfessor(): void {
    this.backToProfessor.emit();
  }

  submit(){
    if(!this.professorForm.valid) return;

    const generatedPassword = this.userService.generatePassword();

    const professorToCreate = {
      ...this.professorForm.value,
      role: 'FACULTY',
      password: generatedPassword
    }

    this.userService.createUser(professorToCreate).subscribe({
      next: (userCreated: User) => {
        if(!userCreated.id) return;
        if(this.selectedProfileImage){
          this.processProfileImage(userCreated);
        }
        if(this.isRightIndex && this.isRightThumb){
          this.registerFingerprintData(userCreated);
        }
        this.displayMessage(true);
        this.professorAdded.emit(userCreated);
        this.mailService.mailCredentials(professorToCreate, generatedPassword);
      },
      error: error => {
        this.displayMessage(false, error.error);
      }
    });
  }

  processProfileImage(professor: User) {
    const formData = new FormData();
    formData.append('userId', `${professor.id}`);
    formData.append('profileImage', this.selectedProfileImage , `user-${professor.id}-img.png`);
    this.userService.processProfileImage(formData).subscribe({
      next: () => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Image = reader.result as string;

          this.faceRecognitionService.encodeFaceData(professor, base64Image).subscribe();
        };

        reader.onerror = (error) => {
          console.error("Error converting image to base64:", error);
        };

        if (this.selectedProfileImage) {
          reader.readAsDataURL(this.selectedProfileImage);
        }
      }
    });
  }

  resetFingerprint(): void{
    this.isRightThumb = false;
    this.isRightIndex = false;
    this.rightIndexFingerprintImageSrc = null;
    this.rightThumbFingerprintImageSrc = null;
    this.rightThumbState = 'Scan Left Index';
    this.rightIndexState = 'Scan Right Index';
    this.hasRightThumb = false;
  }

  registerFingerprintData(professor: User){
    const formData = new FormData();
    formData.append('userId', `${professor.id}`);
    formData.append('fingerprint', this.rightIndexFingerprintImageSrc!,
      `right-index-${professor.lastName}.png`)
    formData.append('fingerprint', this.rightThumbFingerprintImageSrc!,
      `right-thumb-${professor.lastName}.png`)

    this.fingerprintService.registerFingerprint(formData).subscribe({
      next: (value) => {
        console.log(value);
      }
    })
  }

  displayMessage(success: boolean, message?: string) {
    const dialogRef = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: success ? 'Professor Successfully Added!' : 'Something went wrong',
        message: success ? 'Professor has been added to the system successfully.' : message
      }
    })

    dialogRef.afterClosed().subscribe(() => {
      if(!success) return;
      this.backToProfessor.emit();
    })
  }

  onStepChange(event: StepperSelectionEvent): void {
    switch (event.selectedIndex) {
      case 0:
        this.currentStepLabel = 'Set Up Information';
        break;
      case 1:
        this.currentStepLabel = 'Professor\'s Picture';
        break;
      case 2:
        this.currentStepLabel = 'Professor\'s Biometrics';
        break;
      default:
        this.currentStepLabel = 'Unknown Step';
        break;
    }
  }

  onFileChanges(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedProfileImage = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imageSrc = reader.result;
      };
      reader.readAsDataURL(file);

      this.imageButtonLabel = 'Next';
    }
  }

  openCamera() {
    this.isCameraOpen = true;
    this.captureButtonLabel = 'Capture Photo';
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      this.stream = stream;
      this.videoElement = this.videoElementRef.nativeElement;
      this.videoElement.srcObject = stream;
      this.videoElement.play();
    }).catch(err => {
      // Handle error silently
    });
  }

  ngOnDestroy(): void {
      if(this.stream){
        this.stream.getTracks().forEach(track => track.stop());
      }
  }

  capturePhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      this.selectedProfileImage = blob!;
      const reader = new FileReader();
      reader.onload = () => {
        this.imageSrc = reader.result;
        this.imageButtonLabel = 'Next';
      };
      reader.readAsDataURL(blob!);
    });
    this.closeCamera();
  }

  closeCamera() {
    this.isCameraOpen = false;
    this.captureButtonLabel = 'Retake Photo';
    const stream = this.videoElement.srcObject as MediaStream;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    this.videoElement.srcObject = null;
  }

  private base64ToBlob(src: string, imagePng: string) {
    return this.sdkService.base64ToBlob(src, imagePng);
  }
}
