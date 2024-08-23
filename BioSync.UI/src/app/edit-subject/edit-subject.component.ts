import {Component, Output, EventEmitter, OnInit, Input} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subject} from "../../model/subject-model";
import {MatButtonModule} from "@angular/material/button";
import {MatDialog} from "@angular/material/dialog";
import {SubjectService} from "../../services/subject.service";
import {PromptOkayComponent} from "../prompt-okay/prompt-okay.component";

@Component({
  selector: 'app-edit-subject',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule],
  templateUrl: './edit-subject.component.html',
  styleUrl: './edit-subject.component.css'
})
export class EditSubjectComponent implements OnInit{
  @Output() backToEditSubject = new EventEmitter<void>();
  @Output() updatedSubject = new EventEmitter<Subject>();
  @Input() selectedSubject!: Subject;
  subjectForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private subjectService: SubjectService
  ) {}

  ngOnInit() {
    this.initForm();
    this.setFormValue();
  }

  initForm(){
    this.subjectForm = this.formBuilder.group({
      id: [],
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      description: ['', Validators.required]
    });
  }

  setFormValue(){
    this.subjectForm.patchValue({
      id: this.selectedSubject.id,
      code: this.selectedSubject.code,
      name: this.selectedSubject.name,
      description: this.selectedSubject.description,
    })
  }

  returnToSubjectView(): void {
    this.backToEditSubject.emit();
  }

  submit() {
    if(!this.subjectForm.touched || !this.subjectForm.valid) return;

    const subjectToUpdate = this.subjectForm.value;

    this.subjectService.updateSubject(subjectToUpdate).subscribe({
      next: (subjectUpdated: Subject) => {
        if(!subjectUpdated.id) return;
        this.updatedSubject.emit(subjectUpdated);
        this.openSuccessDialog();
      }

    })
    return;
  }

  openSuccessDialog(){
    const ref = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Subject Updated!',
        message: 'Subject details has been updated successfully.'
      }
    })

    ref.afterClosed().subscribe({
      next: () => {
        this.returnToSubjectView();
      }
    })
  }
}
