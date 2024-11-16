import {Component, Output, EventEmitter, OnInit, Input} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {
  FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, 
  Validators, AbstractControl
} from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import {VisitorService} from "../../../services/visitor.service";
import {Visitor} from "../../../model/visitor.model";
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../../prompt/prompt-okay/prompt-okay.component";
import { letterOnlyValidator } from '../visitor.validation';

@Component({
  selector: 'app-edit-visitor',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule
  ],
  providers: [VisitorService],
  templateUrl: './edit-visitor.component.html',
  styleUrl: './edit-visitor.component.css'
})
export class EditVisitorComponent implements OnInit{
  @Output() backToEditVisitor = new EventEmitter<void>();
  @Output() editedVisitor: EventEmitter<Visitor> = new EventEmitter<Visitor>();
  @Input() visitor!: Visitor;
  visitorForm!: FormGroup;

  labs: string[] = [
    'DOST Laboratory',
    'Aboitiz Laboratory',
  ];

  visitPurposes: string[] =[
    'Panelist',
    'Organizer',
    'Clearance'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private visitorService: VisitorService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.initEditForm();
    this.setFormValues();
  }
  
  initEditForm(){
    this.visitorForm = this.formBuilder.group({
      id: ['', [Validators.required]],
      name: ['', [Validators.required, letterOnlyValidator()]],
      purposeOfVisit: ['', [Validators.required]],
      otherDetails: ['',[Validators.maxLength(50), letterOnlyValidator()]],
      destination: ['', [Validators.required]],
      visitDate: ['', [Validators.required]],
    });
  }

  setFormValues(){
    this.visitorForm.patchValue({
      id: this.visitor.id,
      name: this.visitor.name,
      purposeOfVisit: this.visitor.purposeOfVisit,
      otherDetails: this.visitor.otherDetails,
      destination: this.visitor.destination,
      visitDate: this.visitor.visitDate,
    })
  }

  returnToVisitorPage(): void {
    this.backToEditVisitor.emit();
  }

  submit() {
    if(!this.visitorForm.valid ||!this.visitorForm.touched) return;

    const updatedVisitor = this.visitorForm.value;

    this.visitorService.updateVisitor(updatedVisitor).subscribe({
      next: value => {
        if(!value.id) return;
        this.openSuccessDialog();
        this.editedVisitor.emit(value);
      }
    });

    return;
  }

  openSuccessDialog(){
    const ref = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Visitor Updated!',
        message: 'Visitor has been updated successfully.'
      }
    })

    ref.afterClosed().subscribe({
      next: () => {
        this.returnToVisitorPage();
      }
    })
  }

  get nameControl(): AbstractControl {
    return this.visitorForm.get('name')!;
  }
  
  get purposeOfVisitControl(): AbstractControl {
    return this.visitorForm.get('purposeOfVisit')!;
  }

  get otherDetailsControl(): AbstractControl {
    return this.visitorForm.get('otherDetails')!;
  }
  
  get destinationControl(): AbstractControl {
    return this.visitorForm.get('destination')!;
  }
}
