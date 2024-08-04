import {Component, Output, EventEmitter, OnInit, inject} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AddSubjectService} from "./add-subject.service";
import {Subject} from "../../model/subject-model";
import {MatButtonModule} from "@angular/material/button";
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../prompt-okay/prompt-okay.component";
import {PromptConfirmComponent} from "../prompt-confirm/prompt-confirm.component";

@Component({
  selector: 'app-add-subject',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule
  ],
  providers: [AddSubjectService],
  templateUrl: './add-subject.component.html',
  styleUrl: './add-subject.component.css'
})
export class AddSubjectComponent implements OnInit{
  @Output() backToSubject = new EventEmitter<void>();
  @Output() subjectAdded = new EventEmitter<Subject>();
  subjectForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private addSubjectService: AddSubjectService,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.subjectForm = this.formBuilder.group({
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      description: ['', Validators.required]
    });
  }

  cancelAddSubject(): void {
    this.backToSubject.emit();
  }

  submit(){
    if(!this.subjectForm.valid) {
      console.log('invalid');
      return;
    }

    const subject = this.subjectForm.value;
    this.addSubjectService.createSubject(subject).subscribe({
      next: (subject: Subject) => {
        console.log(subject);
        this.subjectForm.reset();
        this.openDialog();
        this.subjectAdded.emit(subject);
      },
      error: err => console.error(err)
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(PromptOkayComponent, {
      width: '400px'
    })

    dialogRef.afterClosed().subscribe(result => {
      this.backToSubject.emit();
    })
  }
}
