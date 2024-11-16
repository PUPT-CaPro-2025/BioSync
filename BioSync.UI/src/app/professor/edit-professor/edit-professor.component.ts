import {Component, Output, EventEmitter, OnInit, Input, ViewEncapsulation} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {
  FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, 
  Validators, AbstractControl
} from '@angular/forms';
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
import { 
  customEmailValidator 
} from '../../../services/validators/customEmailValidator';
import { facultyNameValidator } from '../professor.validation';

@Component({
  selector: 'app-edit-professor',
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
  providers: [UserService, SdkService, FingerprintService],
  templateUrl: './edit-professor.component.html',
  styleUrls: ['./edit-professor.component.css', '../../student/add-student/add-student.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class EditProfessorComponent implements OnInit{
  @Output() backToEditProfessor = new EventEmitter<void>();
  @Output() editedProfessor = new EventEmitter<User>();
  @Input() professorToBeUpdated!: User;
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
    '3rd'
  ];

  professorForm!: FormGroup;
  currentStepLabel: string = 'Set Up Information';
  imageForm!: FormGroup;
  selectedProfileImage!: Blob;
  imageSrc: string | ArrayBuffer | null = null;
  rightThumbFingerprintImageSrc!: Blob;
  rightIndexFingerprintImageSrc!: Blob;
  rightThumbState = 'Scan Right Thumb';
  hasRightThumb = false;
  isRightThumb = false;
  rightIndexState = 'Scan Right Index';
  isRightIndex = false;
  imageButtonLabel = 'Skip';

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private dialog: MatDialog,
    private sdkService: SdkService,
    private fingerprintService: FingerprintService,
  ) {}

  ngOnInit() {
    this.initForm();
    this.setFormValues();
    this.sdkService.loadSDK();

    this.sdkService.getImageSrc().subscribe({
      next: (src) => {
        if (src) {
          if(this.rightThumbFingerprintImageSrc == null){
            this.rightThumbFingerprintImageSrc = this.base64ToBlob(src, 'image/png');
            this.isRightThumb = true;
            setTimeout(() => {
              this.rightThumbState = 'Right Thumb Captured';
              this.hasRightThumb = true;
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

  initForm(){
    this.professorForm = this.formBuilder.group({
      usercode: ['', [Validators.required]],
      firstName: ['', [Validators.required, facultyNameValidator()]],
      lastName: ['', [Validators.required, facultyNameValidator()]],
      middleName: ['', [facultyNameValidator()]],
      suffix: ['', [Validators.required]],
      email: ['', [Validators.required, 
        Validators.email, customEmailValidator()
      ]],
    });

    this.imageForm = this.formBuilder.group({
      profileImage: [null, Validators.required]
    })
  }

  setFormValues(){
    this.professorForm.patchValue({
      usercode: this.professorToBeUpdated.usercode,
      firstName: this.professorToBeUpdated.firstName,
      lastName: this.professorToBeUpdated.lastName,
      middleName: this.professorToBeUpdated.middleName,
      suffix: this.professorToBeUpdated.suffix,
    })
  }

  returnToProfessorView(): void {
    this.backToEditProfessor.emit();
  }

  submit(){
    if(!this.professorForm.touched || !this.professorForm.valid) return;

    const updatedValues = this.professorForm.value;

    this.professorToBeUpdated = {
      ...updatedValues,
      id: this.professorToBeUpdated.id,
      password: this.professorToBeUpdated.password,
      role: this.professorToBeUpdated.role,
    }

    this.userService.updateUser(this.professorToBeUpdated).subscribe({
      next: (updatedProfessor: User) => {
        if(!updatedProfessor.id) return;
        this.editedProfessor.emit(updatedProfessor);
        this.openSuccessDialog();
      }
    })
    return;
  }

  openSuccessDialog(){
    const ref = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Professor Updated!',
        message: 'Professor details has been updated successfully.'
      }
    })

    ref.afterClosed().subscribe({
      next: () => {
        this.returnToProfessorView();
      }
    })
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
       this.backToEditProfessor.emit();
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

  private base64ToBlob(src: string, imagePng: string) {
    return this.sdkService.base64ToBlob(src, imagePng);
  }

  get userCodeControl(): AbstractControl {
    return this.professorForm.get('usercode')!;
  }
  
  get firstNameControl(): AbstractControl {
    return this.professorForm.get('firstName')!;
  }

  get lastNameControl(): AbstractControl {
    return this.professorForm.get('lastName')!;
  }

  get middleNameControl(): AbstractControl {
    return this.professorForm.get('middleName')!;
  }
  
  get suffixControl(): AbstractControl {
    return this.professorForm.get('suffix')!;
  }

  get emailControl(): AbstractControl {
    return this.professorForm.get('email')!;
  }
}
