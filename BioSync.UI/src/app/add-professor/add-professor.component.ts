import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import {UserService} from "../../services/user.service";
import {User} from "../../model/user.model";
import {PromptOkayComponent} from "../prompt-okay/prompt-okay.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-add-professor',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule],
  providers: [UserService],
  templateUrl: './add-professor.component.html',
  styleUrl: './add-professor.component.css'
})
export class AddProfessorComponent implements OnInit{
  @Output() backToProfessor = new EventEmitter<void>();

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
        this.displaySuccess()
      },
      error: error => { console.log(error); }
    });
  }

  displaySuccess() {
    const dialogRef = this.dialog.open(PromptOkayComponent, {
      width: '400px'
    })

    dialogRef.afterClosed().subscribe(result => {
       this.backToProfessor.emit();
    })
  }
}
