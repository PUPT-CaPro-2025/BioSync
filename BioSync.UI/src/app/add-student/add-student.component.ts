import {Component, EventEmitter, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import {MatSelectChange, MatSelectModule} from '@angular/material/select';
import {ProgramService} from "../../services/program.service";
import {Program} from "../../model/program.model";
import {UserService} from "../../services/user.service";
import {User} from "../../model/user.model";
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../prompt-okay/prompt-okay.component";
import {Section} from "../../model/section.model";
import {SectionService} from "../../services/section.service";
import {MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious} from "@angular/material/stepper";
import {SdkService} from "../../services/sdk.service";
import {FingerprintService} from "../../services/fingerprint.service";
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-student',
  standalone: true,
  imports: [MatToolbarModule,
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
    CommonModule
  ],
  providers: [
    ProgramService,
    UserService,
    SectionService
  ],
  templateUrl: './add-student.component.html',
  styleUrl: './add-student.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AddStudentComponent implements OnInit{
  @Output() backToStudent = new EventEmitter<void>();
  @Output() addedStudent = new EventEmitter<User>();
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

  allPrograms: Program[] = [];

  sections: Section[] = [];
  filteredSections: Section[] = [];
  studentForm!: FormGroup;
  imageForm!: FormGroup;
  selectedProfileImage!: Blob;
  rightThumbFingerprintImageSrc!: Blob;
  rightIndexFingerprintImageSrc!: Blob;
  rightThumbState = 'waiting for scanned data..';
  hasRightThumb = false;
  isRightThumb = false;
  rightIndexState = 'waiting for scanned data..';
  isRightIndex = false;
  imageSrc: string | ArrayBuffer | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private programService: ProgramService,
    private userService: UserService,
    private dialog: MatDialog,
    private sectionService: SectionService,
    private sdkService: SdkService,
    private fingerprintService: FingerprintService
  ) {}

  ngOnInit() {
    this.getAllPrograms();
    this.initForm();
    this.getAllSections();
    this.sdkService.loadSDK();

    this.sdkService.getImageSrc().subscribe({
      next: (src) => {
        if (src) {
          if(this.rightThumbFingerprintImageSrc == null){
            this.rightThumbFingerprintImageSrc = this.base64ToBlob(src, 'image/png');
            this.isRightThumb = true;
            this.rightThumbState = 'Right Thumb Captured';
            this.hasRightThumb = true;
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
    this.studentForm = this.formBuilder.group({
      usercode: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      middleName: [''],
      suffix: ['', [Validators.required]],
      program: ['', [Validators.required]],
      section: ['',Validators.required],
      email: ['',Validators.required]
    });

    this.imageForm = this.formBuilder.group({
      profileImage: [null, Validators.required]
    })
  }

  onProgramChange(event: MatSelectChange){
    this.filteredSections = this.sections.filter(section =>
      section.program.id === event.value);
  }

  getAllPrograms() : Program[] {
    this.programService.getAllPrograms().subscribe({
      next: (programs: Program[]) => {
        this.allPrograms = programs;
      },
      error: error => { console.error(error); }
    })

    return this.allPrograms;
  }

  getAllSections(){
    this.sectionService.getSections().subscribe({
      next: (sections: Section[]) => {
        this.sections = sections;
      }
    })
  }

  returnToStudentView(): void {
    this.backToStudent.emit();
  }

  submit(){
    if(!this.studentForm.valid || !this.studentForm.touched) return;

    let studentToAdd = this.studentForm.value;

    let selectedProgram = this.allPrograms.find(
      (program: Program) => program.id === studentToAdd.program);

    studentToAdd = {
      ...studentToAdd,
      section: this.sections.find((section: Section) =>
        section.id === this.studentForm.get('section')?.value),
      program: selectedProgram,
      role: 'STUDENT',
      password: 'student123'
    }

    this.userService.createUser(studentToAdd).subscribe({
      next: (student: User) => {
        if(!student.id) return;
        this.processProfileImage(student.id)
        this.registerFingerprintData(student);
        this.openSuccessDialog();
        this.addedStudent.emit(student);
        this.returnToStudentView();
      }
    })

    return;
  }

  processProfileImage(studentId: number) {
    const formData = new FormData();
    formData.append('userId', `${studentId}`);
    formData.append('profileImage', this.selectedProfileImage , `user-${studentId}-img.png`);
    this.userService.processProfileImage(formData).subscribe();
  }


  registerFingerprintData(student: User){
    const formData = new FormData();
    formData.append('userId', `${student.id}`);
    formData.append('fingerprint', this.rightIndexFingerprintImageSrc,
      `right-index-${student.lastName}.png`)
    formData.append('fingerprint', this.rightThumbFingerprintImageSrc,
      `right-thumb-${student.lastName}.png`)

    this.fingerprintService.registerFingerprint(formData).subscribe({
      next: (value) => {
        console.log(value);
      }
    })
  }

  openSuccessDialog(){
    this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Student Added!',
        message: 'Student has been added successfully.'
      }
    })
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
    }
  }

  currentStepLabel: string = 'Set Up Information';

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
}
