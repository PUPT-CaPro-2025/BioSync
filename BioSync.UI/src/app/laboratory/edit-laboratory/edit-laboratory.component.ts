import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {
  FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, 
  Validators, AbstractControl
} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { Laboratory } from '../../../model/laboratory.model';
import { MatDialog } from '@angular/material/dialog';
import {PromptOkayComponent} from "../../prompt/prompt-okay/prompt-okay.component";
import { LaboratoryService } from '../../../services/laboratory.service';

@Component({
  selector: 'app-edit-laboratory',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
  ],
  providers: [LaboratoryService],
  templateUrl: './edit-laboratory.component.html',
  styleUrl: './edit-laboratory.component.css'
})
export class EditLaboratoryComponent implements OnInit {
  @Output() backToEditLaboratory = new EventEmitter<void>();
  @Output() updatedLaboratory = new EventEmitter<Laboratory>();
  @Input() selectedLaboratory!: Laboratory;
  laboratoryForm!: FormGroup;

  constructor(private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private laboratoryService: LaboratoryService
  ) {}

  ngOnInit() {
    this.initForm();
    this.setFormValue();
  }

  initForm(){
    this.laboratoryForm = this.formBuilder.group({
      id: [],
      name: ['', [Validators.required]],
      roomCode: ['', [Validators.required]],
      capacity: ['', [Validators.required, Validators.min(1), Validators.max(80)]]
    });
  }

  setFormValue(){
    this.laboratoryForm.patchValue({
      id: this.selectedLaboratory.id,
      name: this.selectedLaboratory.name,
      roomCode: this.selectedLaboratory.roomCode,
      capacity: this.selectedLaboratory.capacity,
    })
  }

  returnToLaboratoryView(): void {
    this.backToEditLaboratory.emit();
  }

  submit() {
    if(!this.laboratoryForm.touched || !this.laboratoryForm.valid) return;

    const laboratoryToUpdate = this.laboratoryForm.value;

    this.laboratoryService.updateLaboratory(laboratoryToUpdate).subscribe({
      next: (laboratoryUpdated: Laboratory) => {
        if(!laboratoryUpdated.id) return;
        this.updatedLaboratory.emit(laboratoryUpdated);
        this.openSuccessDialog();
      }

    })
    return;
  }

  openSuccessDialog(){
    const ref = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Laboratory Updated!',
        message: 'Laboratory details has been updated successfully.'
      }
    })

    ref.afterClosed().subscribe({
      next: () => {
        this.returnToLaboratoryView();
      }
    })
  }

  get nameControl(): AbstractControl {
    return this.laboratoryForm.get('name')!;
  }
  
  get roomCodeControl(): AbstractControl {
    return this.laboratoryForm.get('roomCode')!;
  }

  get capacityControl(): AbstractControl {
    return this.laboratoryForm.get('capacity')!;
  }
}
