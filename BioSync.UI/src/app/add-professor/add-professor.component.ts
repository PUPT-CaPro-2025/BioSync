import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import {UserService} from "../../services/user.service";
import {User} from "../../model/user.model";
import {PromptOkayComponent} from "../prompt-okay/prompt-okay.component";
import {MatDialog} from "@angular/material/dialog";
import {StepperSelectionEvent} from "@angular/cdk/stepper";
import {MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious} from "@angular/material/stepper";
import {SdkService} from "../../services/sdk.service";
import {FingerprintService} from "../../services/fingerprint.service";

@Component({
  selector: 'app-add-professor',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule, MatStep, MatStepper, MatStepLabel, MatStepperNext, MatStepperPrevious],
  providers: [UserService, SdkService, FingerprintService],
  templateUrl: './add-professor.component.html',
  styleUrls: ['./add-professor.component.css', '../add-student/add-student.component.css']
})
export class AddProfessorComponent implements OnInit{
  @Output() backToProfessor = new EventEmitter<void>();
  @Output() professorAdded = new EventEmitter<User>();

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
    '3rd'
  ];

  professorForm!: FormGroup;
  currentStepLabel: string = 'Set Up Information';
  imageForm!: FormGroup;
  selectedProfileImage!: Blob;
  imageSrc: string | ArrayBuffer | null = null;
  rightThumbFingerprintImageSrc!: Blob;
  rightIndexFingerprintImageSrc!: Blob;
  rightThumbState = 'waiting for scanned data..';
  hasRightThumb = false;
  rightIndexState = 'waiting for scanned data..';

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private dialog: MatDialog,
    private sdkService: SdkService,
    private fingerprintService: FingerprintService
  ) {}

  ngOnInit() {
    this.initForm();

    this.sdkService.loadSDK();

    this.sdkService.getImageSrc().subscribe({
      next: (src) => {
        if (src) {
          if(this.rightThumbFingerprintImageSrc == null){
            this.rightThumbFingerprintImageSrc = this.base64ToBlob(src, 'image/png');
            this.rightThumbState = 'Right Thumb Captured';
            this.hasRightThumb = true;
          } else {
            this.rightIndexFingerprintImageSrc = this.base64ToBlob(src, 'image/png');
            this.rightIndexState = 'Right Index Captured';
          }
        }
      }
    });
  }

  initForm(){
    this.professorForm = this.formBuilder.group({
      usercode: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      middleName: [''],
      suffix: ['', [Validators.required]]
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

    const professorToCreate = {
      ...this.professorForm.value,
      role: 'FACULTY',
      password: 'test123'
    }

    this.userService.createUser(professorToCreate).subscribe({
      next: (userCreated: User) => {
        if(!userCreated.id) return;
        this.processProfileImage(+userCreated.id);
        this.registerFingerprintData(userCreated);
        this.displaySuccess()
        this.professorAdded.emit(userCreated);
      },
      error: error => { console.log(error); }
    });
  }

  processProfileImage(professorId: number) {
    const formData = new FormData();
    formData.append('userId', `${professorId}`);
    formData.append('profileImage', this.selectedProfileImage , `user-${professorId}-img.png`);
    this.userService.processProfileImage(formData).subscribe();
  }

  registerFingerprintData(professor: User){
    const formData = new FormData();
    formData.append('userId', `${professor.id}`);
    formData.append('fingerprint', this.rightIndexFingerprintImageSrc,
      `right-index-${professor.lastName}.png`)
    formData.append('fingerprint', this.rightThumbFingerprintImageSrc,
      `right-thumb-${professor.lastName}.png`)

    this.fingerprintService.registerFingerprint(formData).subscribe({
      next: (value) => {
        console.log(value);
      }
    })
  }

  displaySuccess() {
    const dialogRef = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Professor Successfully Added!',
        message: 'Professor has been added to the system successfully.'
      }
    })

    dialogRef.afterClosed().subscribe(() => {
       this.backToProfessor.emit();
    })
  }

  onStepChange(event: StepperSelectionEvent): void {
    switch (event.selectedIndex) {
      case 0:
        this.currentStepLabel = 'Set Up Information';
        break;
      case 1:
        this.currentStepLabel = 'Student\'s Picture';
        break;
      case 2:
        this.currentStepLabel = 'Student\'s Biometrics';
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
    }
  }

  private base64ToBlob(src: string, imagePng: string) {
    return this.sdkService.base64ToBlob(src, imagePng);
  }
}
