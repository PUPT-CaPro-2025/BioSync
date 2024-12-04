import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Input,
  ViewEncapsulation,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { ProgramService } from '../../../services/program.service';
import { Program } from '../../../model/program.model';
import { UserService } from '../../../services/user.service';
import { User } from '../../../model/user.model';
import { MatDialog } from '@angular/material/dialog';
import { PromptOkayComponent } from '../../prompt/prompt-okay/prompt-okay.component';
import { Section } from '../../../model/section.model';
import { SectionService } from '../../../services/section.service';
import {
  MatStep,
  MatStepLabel,
  MatStepper,
  MatStepperNext,
  MatStepperPrevious,
} from '@angular/material/stepper';
import { SdkService } from '../../../services/sdk.service';
import { FingerprintService } from '../../../services/fingerprint.service';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MailService } from '../../../services/mail.service';

@Component({
  selector: 'app-edit-student',
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
  templateUrl: './edit-student.component.html',
  styleUrls: [
    './edit-student.component.css',
    '../add-student/add-student.component.css',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class EditStudentComponent implements OnInit, OnDestroy {
  @Output() backToEditStudent = new EventEmitter<void>();
  @Output() editedStudent = new EventEmitter<User>();
  @Input() selectedStudent!: User;
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
  editStudentForm!: FormGroup;
  studentForm!: FormGroup;
  imageForm!: FormGroup;
  selectedProfileImage!: Blob;
  rightThumbFingerprintImageSrc!: Blob;
  rightIndexFingerprintImageSrc!: Blob;
  rightThumbState = 'Scan Left Index';
  hasRightThumb = false;
  isRightThumb = false;
  rightIndexState = 'Scan Right Index';
  isRightIndex = false;
  imageSrc: string | ArrayBuffer | null = null;
  photoButtonLabel = 'Skip';
  videoElement!: HTMLVideoElement;
  isCameraOpen = false;
  captureButtonLabel = 'Take Photo';
  private stream: MediaStream | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private programService: ProgramService,
    private dialog: MatDialog,
    private sectionService: SectionService,
    private sdkService: SdkService,
    private fingerprintService: FingerprintService
  ) {}

  ngOnInit() {
    this.initForm();
    this.getAllPrograms();
    this.setFormValues();
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
            setTimeout(() => {
              this.rightThumbState = 'Left Index Captured';
              this.hasRightThumb = true;
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
    this.editStudentForm = this.formBuilder.group({
      usercode: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      middleName: [''],
      suffix: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      program: ['', [Validators.required]],
      section: [0, [Validators.required]],
    });
  }

  getAllPrograms() {
    this.programService.getAllPrograms().subscribe({
      next: (programs: Program[]) => {
        this.allPrograms = programs;
      },
    });
  }

  setFormValues() {
    console.log(this.selectedStudent.suffix)
    this.editStudentForm.patchValue({
      usercode: this.selectedStudent.usercode,
      firstName: this.selectedStudent.firstName,
      lastName: this.selectedStudent.lastName,
      middleName: this.selectedStudent.middleName,
      suffix: this.selectedStudent.suffix ? this.selectedStudent.suffix : 'N/A',
      email: this.selectedStudent.email,
      program: this.selectedStudent.program?.id,
      section: this.selectedStudent.section?.id,
    });

    this.fingerprintService
      .getProfileImageUrl(this.selectedStudent.id)
      .subscribe({
        next: (value) => {
          this.imageSrc = value.profileImageUrl;
        },
      });
  }

  returnToStudentView(): void {
    this.backToEditStudent.emit();
  }

  submit() {
    if (
      !this.editStudentForm.valid &&
      !this.editStudentForm.touched &&
      !this.selectedProfileImage
    )
      return;

    const updatedValues = this.editStudentForm.value;

    let selectedProgram = this.allPrograms.find(
      (program: Program) => program.id === this.selectedStudent.program?.id
    );

    let selectedSection = this.sections.find(
      (section: Section) =>
        section.id === this.editStudentForm.get('section')?.value
    );

    const studentToUpdate = {
      ...updatedValues,
      program: selectedProgram,
      section: selectedSection,
      id: this.selectedStudent.id,
      password: this.selectedStudent.password,
      role: this.selectedStudent.role,
    };

    this.userService.updateUser(studentToUpdate).subscribe({
      next: (updatedUser: User) => {
        if (!updatedUser.id) return;
        if (this.selectedProfileImage) {
          this.processProfileImage(updatedUser.id);
        }
        if (this.isRightIndex && this.isRightThumb) {
          this.registerFingerprintData(updatedUser);
        }
        this.editedStudent.emit(updatedUser);
        this.openSuccessDialog();
      },
    });

    return;
  }

  onProgramChange(event: MatSelectChange) {
    this.filteredSections = this.sections.filter(
      (section) => section.program.id === event.value
    );
  }

  getAllSections() {
    this.sectionService.getSections().subscribe({
      next: (sections: Section[]) => {
        this.sections = sections;
        this.filteredSections = this.sections.filter(
          (section) =>
            section.program.id === this.selectedStudent.section?.program.id
        );
      },
    });
  }

  openSuccessDialog() {
    const ref = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Student Updated!',
        message: 'Students record has been updated successfully.',
      },
    });

    ref.afterClosed().subscribe({
      next: () => {
        this.returnToStudentView();
      },
    });
  }

  processProfileImage(studentId: number) {
    const formData = new FormData();
    formData.append('userId', `${studentId}`);
    formData.append(
      'profileImage',
      this.selectedProfileImage,
      `user-${studentId}-img.png`
    );
    this.userService.editProfileImage(formData).subscribe({
      next: (value) => {
        console.log(value);
      },
      error: (err) => console.error(err),
    });
  }

  registerFingerprintData(student: User) {
    const formData = new FormData();
    formData.append('userId', `${student.id}`);
    formData.append(
      'fingerprint',
      this.rightIndexFingerprintImageSrc,
      `right-index-${student.lastName}.png`
    );
    formData.append(
      'fingerprint',
      this.rightThumbFingerprintImageSrc,
      `right-thumb-${student.lastName}.png`
    );

    this.fingerprintService.registerFingerprint(formData).subscribe({
      next: (value) => {
        console.log(value);
      },
    });
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
