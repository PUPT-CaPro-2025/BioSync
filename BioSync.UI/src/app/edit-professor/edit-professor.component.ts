import {Component, Output, EventEmitter, OnInit, Input} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import {User} from "../../model/user.model";
import {UserService} from "../../services/user.service";
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../prompt-okay/prompt-okay.component";

@Component({
  selector: 'app-edit-professor',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule],
  providers: [UserService],
  templateUrl: './edit-professor.component.html',
  styleUrl: './edit-professor.component.css'
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

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.initForm();
    this.setFormValues();
  }

  initForm(){
    this.professorForm = this.formBuilder.group({
      usercode: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      middleName: ['', [Validators.required]],
      suffix: ['', [Validators.required]]
    });
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
        this.returnToProfessorView();
      }
    })
    return;
  }

  openSuccessDialog(){
    this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Professor Updated!',
        message: 'Professor details has been updated successfully.'
      }
    })
  }
}
