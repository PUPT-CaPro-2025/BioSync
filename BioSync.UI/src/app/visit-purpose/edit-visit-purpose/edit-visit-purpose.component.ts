import {Component, Output, EventEmitter, OnInit, Input} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {
  FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, 
  Validators, AbstractControl
} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { VisitPurpose } from '../../../model/visit.purpose.model';
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../../prompt/prompt-okay/prompt-okay.component";
import {VisitPurposeService} from "../../../services/visit.purpose.service";
import { visitPurposeValidator } from '../../../services/validators/customVisitPurposeValidator';

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
  providers: [VisitPurposeService],
  templateUrl: './edit-visit-purpose.component.html',
  styleUrls: ['./edit-visit-purpose.component.css', '../../program/add-program/add-program.component.css']
})
export class EditVisitPurposeComponent implements OnInit {
  visitPurposeForm!: FormGroup;
  @Input() purposeToEdit!: VisitPurpose;
  @Output() editedPurpose = new EventEmitter<VisitPurpose>();
  @Output() backToEditVisitPurpose = new EventEmitter<void>();

  constructor(private formBuilder: FormBuilder,
    private dialog: MatDialog, private visitPurposeService: VisitPurposeService) {}

  ngOnInit() {
    this.initForm();
    this.setFormValues();
  }

  initForm(){
    this.visitPurposeForm = this.formBuilder.group({
       purposeOfVisit: ['', [Validators.required, visitPurposeValidator()]],
    });
  }

  setFormValues(){
    this.visitPurposeForm.patchValue({
      purposeOfVisit: this.purposeToEdit.purposeOfVisit
    })
  }

  returnToVisitPurposeView(): void {
    this.backToEditVisitPurpose.emit();
  }

  get purposeOfVisitControl(): AbstractControl {
      return this.visitPurposeForm.get('purposeOfVisit')!;
  }

  submit(){
    if(!this.visitPurposeForm.valid) return

    const updatedPurpose = this.purposeToEdit;
    updatedPurpose.purposeOfVisit = this.visitPurposeForm.value.purposeOfVisit;

    this.visitPurposeService.updatePurpose(updatedPurpose).subscribe({
      next: value => {
        this.openSuccessDialog();
        this.editedPurpose.emit(value);
      }
    })
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
}
