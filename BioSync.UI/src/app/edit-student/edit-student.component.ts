import {Component, Output, EventEmitter, OnInit, Input} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import {MatSelectChange, MatSelectModule} from '@angular/material/select';
import {User} from "../../model/user.model";
import { Program } from '../../model/program.model';
import {ProgramService} from "../../services/program.service";
import {UserService} from "../../services/user.service";
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../prompt-okay/prompt-okay.component";
import {Section} from "../../model/section.model";
import {SectionService} from "../../services/section.service";

@Component({
  selector: 'app-edit-student',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule],
  providers: [
    UserService,
    ProgramService,
    SectionService
  ],
  templateUrl: './edit-student.component.html',
  styleUrl: './edit-student.component.css'
})
export class EditStudentComponent implements OnInit{
  @Output() backToEditStudent = new EventEmitter<void>();
  @Output() editedStudent = new EventEmitter<User>();
  @Input() selectedStudent!: User;

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

  allPrograms: Program[] = []
  sections: Section[] = [];
  filteredSections: Section[] = [];
  editStudentForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private programService: ProgramService,
    private dialog: MatDialog,
    private sectionService: SectionService,
  ) {}

  ngOnInit() {
    this.initForm();
    this.getAllPrograms();
    this.setFormValues();
    this.getAllSections();
  }

  initForm(){
    this.editStudentForm = this.formBuilder.group({
      usercode: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      middleName: [''],
      suffix: ['', [Validators.required]],
      program: ['', [Validators.required]],
      section: [0, [Validators.required]]
    });
  }

  getAllPrograms(){
    this.programService.getAllPrograms().subscribe({
      next: (programs: Program[]) => {
        this.allPrograms = programs;
      }
    })
  }

  setFormValues(){
    this.editStudentForm.patchValue({
      usercode: this.selectedStudent.usercode,
      firstName: this.selectedStudent.firstName,
      lastName: this.selectedStudent.lastName,
      middleName: this.selectedStudent.middleName,
      suffix: this.selectedStudent.suffix,
      program: this.selectedStudent.program?.id,
      section: this.selectedStudent.section?.id,
    })
  }

  returnToStudentView(): void {
    this.backToEditStudent.emit();
  }

  submit(){
    if(!this.editStudentForm.valid || !this.editStudentForm.touched) return;

    const updatedValues = this.editStudentForm.value;

    let selectedProgram = this.allPrograms.find(
      (program: Program) => program.id === this.selectedStudent.program?.id);

    let selectedSection = this.sections.find((section: Section) =>
      section.id === this.editStudentForm.get('section')?.value);

    const studentToUpdate = {
      ...updatedValues,
      program: selectedProgram,
      section: selectedSection,
      id: this.selectedStudent.id,
      password: this.selectedStudent.password,
      role: this.selectedStudent.role,
    }

    this.userService.updateUser(studentToUpdate).subscribe({
      next: (updatedUser: User) => {
        if(!updatedUser.id) return;
        this.editedStudent.emit(updatedUser);
        this.openSuccessDialog();
      }
    })

    return;
  }

  onProgramChange(event: MatSelectChange){
    this.filteredSections = this.sections.filter(section =>
      section.program.id === event.value);
  }

  getAllSections(){
    this.sectionService.getSections().subscribe({
      next: (sections: Section[]) => {
        this.sections = sections;
        this.filteredSections = this.sections.filter(section =>
          section.program.id === this.selectedStudent.section?.program.id
        )
      }
    })
  }

  openSuccessDialog(){
    const ref = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Student Updated!',
        message: 'Students record has been updated successfully.'
      }
    })

    ref.afterClosed().subscribe({
      next: () => {
        this.returnToStudentView();
      }
    })
  }
}
