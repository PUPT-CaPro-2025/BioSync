import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {
  FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, 
  Validators, AbstractControl
} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { Visitpurpose } from '../../../model/visit.purpose.model';
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../../prompt/prompt-okay/prompt-okay.component";
import { visitPurposeValidator } from '../visit.purpose.validation';

@Component({
  selector: 'app-edit-visit-purpose',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './edit-visit-purpose.component.html',
  styleUrls: ['./edit-visit-purpose.component.css', '../../program/add-program/add-program.component.css']
})
export class EditVisitPurposeComponent implements OnInit {
  visitPurposeForm!: FormGroup;
  @Output() backToEditVisitPurpose = new EventEmitter<void>();

  constructor(private formBuilder: FormBuilder,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.visitPurposeForm = this.formBuilder.group({
      visitPurpose: ['', [Validators.required, visitPurposeValidator()]],
    });
  }

  returnToVisitPurposeView(): void {
    this.backToEditVisitPurpose.emit();
  }

  submit(){
    console.log('Submit button was click!');
  }

  openSuccessDialog(){
    const ref = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Suffix Updated!',
        message: 'Suffix details has been updated successfully.'
      }
    })

    ref.afterClosed().subscribe({
      next: () => {
        this.returnToVisitPurposeView();
      }
    })
  }

  get visitPurposeControl(): AbstractControl {
    return this.visitPurposeForm.get('visitPurpose')!;
  }
}
