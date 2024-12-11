import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../services/user.service';
import { User } from '../../model/user.model';
import { PromptOkayComponent } from '../prompt/prompt-okay/prompt-okay.component';
import { MatDialog } from '@angular/material/dialog';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import {
  MatStep,
  MatStepLabel,
  MatStepper,
  MatStepperNext,
  MatStepperPrevious,
} from '@angular/material/stepper';
import { SdkService } from '../../services/sdk.service';
import { FingerprintService } from '../../services/fingerprint.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Mail } from '../../model/mail.model';
import { MailService } from '../../services/mail.service';
import { FaceRecognitionService } from '../../services/face.recognition.service';
import { CookieService } from '../../services/cookie.service';
import { CryptoService } from '../../services/crypto.service';

@Component({
  selector: 'app-admin-profile',
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
    MatStepper,
    MatStepLabel,
    MatStepperNext,
    MatStepperPrevious,
    MatIconModule,
    CommonModule,
  ],
  providers: [UserService, SdkService, FingerprintService, MailService],
  templateUrl: './admin-profile.component.html',
  styleUrls: [
    './admin-profile.component.css',
    '../student/add-student/add-student.component.css',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AdminProfileComponent implements OnInit {
  //Temporary Suffixes
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
  admin!: User;
  adminForm!: FormGroup;
  currentStepLabel: string = 'Admin Information';
  imageForm!: FormGroup;
  selectedProfileImage!: Blob;
  imageSrc: string | ArrayBuffer | null = null;
  image!: string;
  rightThumbFingerprintImageSrc!: Blob;
  rightIndexFingerprintImageSrc!: Blob;
  rightThumbState = 'Scan Left Index';
  hasRightThumb = false;
  isRightThumb = false;
  rightIndexState = 'Scan Right Index';
  isRightIndex = false;
  imageButtonLabel = 'Skip';
  editMode = false;
  hasFingerprint: boolean = false;
  userId!: number;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private dialog: MatDialog,
    private sdkService: SdkService,
    private fingerprintService: FingerprintService,
    private cookieService: CookieService,
    private cryptoService: CryptoService,
  ) {}

  ngOnInit() {
    this.getUserId();
    this.initForm();
    this.sdkService.loadSDK();
    this.getAdminInfo();
    this.sdkService.getImageSrc().subscribe({
      next: (src) => {
        if (src) {
          if (this.rightThumbFingerprintImageSrc == null) {
            this.rightThumbFingerprintImageSrc = this.base64ToBlob(
              src,
              'image/png',
            );
            this.isRightThumb = true;
            setTimeout(() => {
              this.rightThumbState = 'Left Index Captured';
              this.hasRightThumb = true;
            }, 2000);
          } else {
            this.rightIndexFingerprintImageSrc = this.base64ToBlob(
              src,
              'image/png',
            );
            this.isRightIndex = true;
            this.rightIndexState = 'Right Index Captured';
          }
        }
      },
    });
  }

  getUserId() {
    const encryptedUserId = decodeURIComponent(
      this.cookieService.getCookie('user_id')!,
    );
    this.userId = +this.cryptoService.decrypt(encryptedUserId);
  }

  getAdminInfo() {
    this.userService.getUserById(this.userId).subscribe({
      next: (user: User) => {
        this.admin = user;
        this.fingerprintService.getProfileImageUrl(this.admin.id).subscribe({
          next: (imageLink) => {
            this.image = imageLink.profileImageUrl;
          },
        });
        console.log(this.admin);
        this.setFormValues();
        this.fingerprintService.hasFingerprint(this.admin.id).subscribe({
          next: (hasFingerprint: boolean) => {
            this.hasFingerprint = hasFingerprint;
          },
        });
      },
    });
  }

  initForm() {
    this.adminForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      middleName: [''],
      suffix: ['', [Validators.required]],
    });

    this.imageForm = this.formBuilder.group({
      profileImage: [null, Validators.required],
    });
  }

  setFormValues() {
    this.adminForm.patchValue({
      firstName: this.admin.firstName,
      lastName: this.admin.lastName,
      email: this.admin.email,
      suffix: 'N/A',
      middleName: this.admin.middleName,
    });
  }

  submit() {
    const updatedValues = this.adminForm.value;

    this.admin = {
      ...this.admin,
      ...updatedValues,
    };

    this.userService.updateUser(this.admin).subscribe({
      next: (updatedUser: User) => {
        if (!updatedUser.id) return;
        if (this.selectedProfileImage) {
          this.processProfileImage(updatedUser.id);
        }
        if (this.isRightIndex && this.isRightThumb) {
          this.registerFingerprintData(updatedUser);
        }
        this.openSuccessDialog();
      },
    });
    return;
  }

  openSuccessDialog() {
    const ref = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Admin Profile Successfully Updated!',
        message: 'Admin Profile has been successfully updated.',
      },
    });

    ref.afterClosed().subscribe({
      next: () => {
        this.unsetEditMode();
      },
    });
  }

  processProfileImage(professorId: number) {
    const formData = new FormData();
    formData.append('userId', `${professorId}`);
    formData.append(
      'profileImage',
      this.selectedProfileImage,
      `user-${professorId}-img.png`,
    );
    this.userService.processProfileImage(formData).subscribe();
  }

  registerFingerprintData(professor: User) {
    const formData = new FormData();
    formData.append('userId', `${professor.id}`);
    formData.append(
      'fingerprint',
      this.rightIndexFingerprintImageSrc,
      `right-index-${professor.lastName}.png`,
    );
    formData.append(
      'fingerprint',
      this.rightThumbFingerprintImageSrc,
      `right-thumb-${professor.lastName}.png`,
    );

    this.fingerprintService.registerFingerprint(formData).subscribe({
      next: (value) => {
        console.log(value);
      },
    });
  }

  displaySuccess() {
    const dialogRef = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Admin Profile Successfully Updated!',
        message: 'Admin Profile has been successfully updated.',
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      //return to what...
    });
  }

  setEditMode() {
    this.editMode = true;
  }

  unsetEditMode() {
    this.editMode = false;
  }

  onStepChange(event: StepperSelectionEvent): void {
    switch (event.selectedIndex) {
      case 0:
        this.currentStepLabel = 'Admin Information';
        break;
      case 1:
        this.currentStepLabel = 'Admin Picture';
        break;
      case 2:
        this.currentStepLabel = 'Admin Biometrics';
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

  private base64ToBlob(src: string, imagePng: string) {
    return this.sdkService.base64ToBlob(src, imagePng);
  }
}
