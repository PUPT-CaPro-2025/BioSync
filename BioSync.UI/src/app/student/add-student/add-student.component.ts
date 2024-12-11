import {Component, EventEmitter, OnInit, Output, ViewEncapsulation, ViewChild, OnDestroy} from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import {MatSelectChange, MatSelectModule} from '@angular/material/select';
import {ProgramService} from "../../../services/program.service";
import {Program} from "../../../model/program.model";
import {UserService} from "../../../services/user.service";
import {User} from "../../../model/user.model";
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../../prompt/prompt-okay/prompt-okay.component";
import {Section} from "../../../model/section.model";
import {SectionService} from "../../../services/section.service";
import {MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious} from "@angular/material/stepper";
import {SdkService} from "../../../services/sdk.service";
import {FingerprintService} from "../../../services/fingerprint.service";
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import {MailService} from "../../../services/mail.service";
import {Mail} from "../../../model/mail.model";
import {
  FaceRecognitionService
} from "../../../services/face.recognition.service";

@Component({
  selector: 'app-add-student',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
    MatStep,
    MatStepLabel,
    MatStepper,
    MatStepperNext,
    MatStepperPrevious,
    MatIconModule,
    CommonModule,
  ],
  providers: [ProgramService, UserService, SectionService, MailService],
  templateUrl: './add-student.component.html',
  styleUrl: './add-student.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AddStudentComponent implements OnInit, OnDestroy {
  @Output() backToStudent = new EventEmitter<void>();
  @Output() addedStudent = new EventEmitter<User>();
  @ViewChild('videoElement') videoElementRef!: any;

  allSuffix: string[] = [
    'N/A',
    'Ph.D.',
    'Ed.D.',
    'D.Phil.',
    'D.Sc.',
    'M.D.',
    'Sr.',
    'Jr.',
    '1st',
    '2nd',
    '3rd',
  ];

  allPrograms: Program[] = [];

  sections: Section[] = [];
  filteredSections: Section[] = [];
  studentForm!: FormGroup;
  imageForm!: FormGroup;
  selectedProfileImage!: Blob;
  rightThumbFingerprintImageSrc: Blob | null = null;
  rightIndexFingerprintImageSrc: Blob | null = null;
  rightThumbState = 'Scan Left Index';
  hasRightThumb = false;
  isRightThumb = false;
  rightIndexState = 'Scan Right Index';
  isRightIndex = false;
  imageSrc: string | ArrayBuffer | null = null;
  photoButtonLabel = 'Skip';
  disableReset = false;
  videoElement!: HTMLVideoElement;
  isCameraOpen = false;
  captureButtonLabel = 'Take Photo';
  private stream: MediaStream | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private programService: ProgramService,
    private userService: UserService,
    private dialog: MatDialog,
    private sectionService: SectionService,
    private sdkService: SdkService,
    private fingerprintService: FingerprintService,
    private mailService: MailService,
    private faceRecognitionService: FaceRecognitionService
  ) {}

  ngOnInit() {
    this.getAllPrograms();
    this.initForm();
    this.getAllSections();
    this.sdkService.loadSDK();

    this.sdkService.getImageSrc().subscribe({
      next: (src) => {
        if (src) {
          if (this.rightThumbFingerprintImageSrc == null) {
            this.rightThumbFingerprintImageSrc = this.base64ToBlob(
              src,
              'image/png'
            );
            this.isRightThumb = true;
            this.disableReset = true;
            setTimeout(() => {
              this.rightThumbState = 'Left Index Captured';
              this.hasRightThumb = true;
              this.disableReset = false;
            }, 2000);
          } else {
            this.rightIndexFingerprintImageSrc = this.base64ToBlob(
              src,
              'image/png'
            );
            this.isRightIndex = true;
            this.rightIndexState = 'Right Index Captured';
          }
        }
      },
    });
  }

  initForm() {
    this.studentForm = this.formBuilder.group({
      usercode: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      middleName: [''],
      suffix: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      program: ['', [Validators.required]],
      section: ['', Validators.required],
    });

    this.imageForm = this.formBuilder.group({
      profileImage: [null, Validators.required],
    });
  }

  onProgramChange(event: MatSelectChange) {
    this.filteredSections = this.sections.filter(
      (section) => section.program.id === event.value
    );
  }

  getAllPrograms(): Program[] {
    this.programService.getAllPrograms().subscribe({
      next: (programs: Program[]) => {
        this.allPrograms = programs;
      },
      error: (error) => {
        console.error(error);
      },
    });

    return this.allPrograms;
  }

  getAllSections() {
    this.sectionService.getSections().subscribe({
      next: (sections: Section[]) => {
        this.sections = sections;
      },
    });
  }

  returnToStudentView(): void {
    this.backToStudent.emit();
  }

  submit() {
    if (!this.studentForm.valid || !this.studentForm.touched) return;

    let studentToAdd = this.studentForm.value;

    let selectedProgram = this.allPrograms.find(
      (program: Program) => program.id === studentToAdd.program
    );

    const generatedPassword = this.userService.generatePassword();

    studentToAdd = {
      ...studentToAdd,
      section: this.sections.find(
        (section: Section) =>
          section.id === this.studentForm.get('section')?.value
      ),
      program: selectedProgram,
      role: 'STUDENT',
      password: generatedPassword,
    };

    this.userService.createUser(studentToAdd).subscribe({
      next: (student: User) => {
        if (!student.id) return;
        if (this.selectedProfileImage) {
          this.processProfileImage(student);
        }
        if (this.isRightIndex && this.isRightThumb) {
          this.registerFingerprintData(student);
        }
        this.openMessageDialog(true);
        this.addedStudent.emit(student);
        this.sendCredentials(studentToAdd, generatedPassword);
      },
      error: (error) => {
        this.openMessageDialog(false, error.error);
      },
    });
  }

  private sendCredentials(studentToAdd: User, generatedPassword: string) {
    const mailContent: Mail = {
      to: studentToAdd.email,
      subject: `BioSync Account Credentials`,
      text: `
        Hello! Welcome to BioSync. Please save your account credentials below\n\n
        Usercode: ${studentToAdd.usercode} \n
        Password: ${generatedPassword}`,
    };

    this.mailService.sendMail(mailContent).subscribe();
  }

  processProfileImage(student: User) {
    const formData = new FormData();
    formData.append('userId', `${student.id}`);
    formData.append(
      'profileImage',
      this.selectedProfileImage,
      `user-${student.id}-img.png`
    );
    this.userService.processProfileImage(formData).subscribe({
      next: () => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Image = reader.result as string;

          this.faceRecognitionService
            .encodeFaceData(student, base64Image)
            .subscribe();
        };

        reader.onerror = (error) => {
          console.error('Error converting image to base64:', error);
        };

        if (this.selectedProfileImage) {
          reader.readAsDataURL(this.selectedProfileImage);
        }
      },
    });
  }

  resetFingerprint() {
    this.isRightThumb = false;
    this.isRightIndex = false;
    this.rightIndexFingerprintImageSrc = null;
    this.rightThumbFingerprintImageSrc = null;
    this.rightThumbState = 'Scan Left Index';
    this.rightIndexState = 'Scan Right Index';
    this.hasRightThumb = false;
  }

  registerFingerprintData(student: User) {
    const formData = new FormData();
    formData.append('userId', `${student.id}`);
    formData.append(
      'fingerprint',
      this.rightIndexFingerprintImageSrc!,
      `right-index-${student.lastName}.png`
    );
    formData.append(
      'fingerprint',
      this.rightThumbFingerprintImageSrc!,
      `right-thumb-${student.lastName}.png`
    );

    this.fingerprintService.registerFingerprint(formData).subscribe({
      next: (value) => {
        console.log(value);
      },
    });
  }

  openMessageDialog(success: boolean, message?: string) {
    const ref = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: success ? 'Student Added!' : 'Something went wrong',
        message: success ? 'Student has been added successfully.' : message,
      },
    });

    ref.afterClosed().subscribe({
      next: () => {
        if (!success) return;
        this.returnToStudentView();
      },
    });
  }

  private base64ToBlob(src: string, imagePng: string) {
    return this.sdkService.base64ToBlob(src, imagePng);
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

      this.photoButtonLabel = 'Next';
    }
  }

  openCamera() {
    this.isCameraOpen = true;
    this.captureButtonLabel = 'Capture Photo';
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this.stream = stream;
        this.videoElement = this.videoElementRef.nativeElement;
        this.videoElement.srcObject = stream;
        this.videoElement.play();
      })
      .catch((err) => {
        // Handle error silently
      });
  }

  ngOnDestroy(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
  }

  capturePhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      this.selectedProfileImage = blob!;
      const reader = new FileReader();
      reader.onload = () => {
        this.imageSrc = reader.result;
        this.photoButtonLabel = 'Next';
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
    tracks.forEach((track) => track.stop());
    this.videoElement.srcObject = null;
  }

  currentStepLabel: string = 'Set Up Information';

  onStepChange(event: StepperSelectionEvent): void {
    switch (event.selectedIndex) {
      case 0:
        this.currentStepLabel = 'Set Up Information';
        break;
      case 1:
        this.currentStepLabel = "Student's Picture";
        break;
      case 2:
        this.currentStepLabel = "Student's Biometrics";
        break;
      default:
        this.currentStepLabel = 'Unknown Step';
        break;
    }
  }
}
