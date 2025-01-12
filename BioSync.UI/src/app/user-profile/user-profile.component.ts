import {Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
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
import { SdkService } from '../../services/sdk.service';
import { FingerprintService } from '../../services/fingerprint.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MailService } from '../../services/mail.service';
import { CookieService } from '../../services/cookie.service';
import { CryptoService } from '../../services/crypto.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    CommonModule,
  ],
  providers: [UserService, SdkService, FingerprintService, MailService],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css', '../student/add-student/add-student.component.css'
  ],
  encapsulation: ViewEncapsulation.None,
})
export class UserProfileComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElementRef!: any;
  user!: User;
  imageForm!: FormGroup;
  selectedProfileImage!: Blob;
  imageSrc: string | ArrayBuffer | null = null;
  image!: string;
  imageButtonLabel = 'Skip';
  editMode = false;
  hasFingerprint: boolean = false;
  userId!: number;
  photoButtonLabel = 'Skip';
  videoElement!: HTMLVideoElement;
  isCameraOpen = false;
  captureButtonLabel = 'Take Photo';
  private stream: MediaStream | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private dialog: MatDialog,
    private fingerprintService: FingerprintService,
    private cookieService: CookieService,
    private cryptoService: CryptoService,
  ) {}

  ngOnInit() {
    this.getUserId();
    this.initForm();
    this.getuserInfo();
  }

  getUserId() {
    const encryptedUserId = decodeURIComponent(
      this.cookieService.getCookie('user_id')!,
    );
    this.userId = +this.cryptoService.decrypt(encryptedUserId);
  }

  getuserInfo() {
    this.userService.getUserById(this.userId).subscribe({
      next: (user: User) => {
        this.user = user;
        this.fingerprintService.getProfileImageUrl(this.user.id).subscribe({
          next: (imageLink) => {
            this.image = imageLink.profileImageUrl;
          },
        });
        console.log(this.user);
        this.setFormValues();
        this.fingerprintService.hasFingerprint(this.user.id).subscribe({
          next: (hasFingerprint: boolean) => {
            this.hasFingerprint = hasFingerprint;
          },
        });
      },
    });
  }

  initForm() {
    this.imageForm = this.formBuilder.group({
      profileImage: [null, Validators.required],
    });
  }

  setFormValues() {
    this.fingerprintService
        .getProfileImageUrl(this.user.id)
        .subscribe({
          next: (value) => {
            this.imageSrc = value.profileImageUrl;
            console.log(this.imageSrc)
          },
        });
  }

  submit() {
    this.userService.updateUser(this.user).subscribe({
      next: (updatedUser: User) => {
        if (!updatedUser.id) return;
        if (this.selectedProfileImage) {
          this.processProfileImage(updatedUser.id);
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
        title: 'user Profile Picture Successfully Updated!',
        message: 'user Profile Picture has been successfully updated.',
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
    this.userService.processProfileImage(formData).subscribe({
      next: () => {
        this.getuserInfo();
      }
    });
  }

  setEditMode() {
    this.editMode = true;
  }

  unsetEditMode() {
    this.editMode = false;
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

  getRole(): string {
    const encryptedRole = <string>decodeURIComponent(this.cookieService.getCookie("role")!);
    return this.cryptoService.decrypt(encryptedRole);
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
      .catch(() => {
        // Handle error silently
      });
  }

  closeCamera() {
    this.isCameraOpen = false;
    this.captureButtonLabel = 'Retake Photo';
    const stream = this.videoElement.srcObject as MediaStream;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    this.videoElement.srcObject = null;
  }

  ngOnDestroy(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
  }

}
