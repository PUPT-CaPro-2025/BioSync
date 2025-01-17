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
import { Laboratory } from '../../../model/laboratory.model';
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../../prompt/prompt-okay/prompt-okay.component";
import { AddLaboratoryService } from '../../../services/add-laboratory.service';
import { 
  laboratoryNameValidator, roomCodeValidator, capacityValidator 
} from '../../../services/validators/customLaboratoryValidator';

@Component({
  selector: 'app-add-laboratory',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
  ],
  providers: [AddLaboratoryService],
  templateUrl: './add-laboratory.component.html',
  styleUrl: './add-laboratory.component.css'
})
export class AddLaboratoryComponent implements OnInit {
  @Output() backToLaboratory = new EventEmitter<void>();
  @Output() laboratoryAdded = new EventEmitter<Laboratory>();
  laboratoryForm!: FormGroup;

  constructor(private formBuilder: FormBuilder,
    private addLaboratoryService: AddLaboratoryService,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.laboratoryForm = this.formBuilder.group({
      name: ['', [Validators.required, laboratoryNameValidator()]],
      roomCode: ['', [Validators.required, roomCodeValidator()]],
      capacity: ['', [Validators.required, Validators.min(1), 
        Validators.max(80), capacityValidator()
      ]], 
    });
  }

  returnToLaboratoryView(): void {
    this.backToLaboratory.emit();
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

  submit(){
    if(!this.laboratoryForm.valid) {
      console.log('invalid');
      return;
    }

    const laboratory = this.laboratoryForm.value;
    this.addLaboratoryService.createLaboratory(laboratory).subscribe({
      next: (laboratory: Laboratory) => {
        console.log(laboratory);
        this.laboratoryForm.reset();
        this.openDialog();
        this.laboratoryAdded.emit(laboratory);
      },
      error: err => console.error(err)
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Laboratory Successfully Added!',
        message: 'Laboratory has been added to the system successfully.'
      }
    })

    dialogRef.afterClosed().subscribe(() => {
      this.backToLaboratory.emit();
    })
  }
}
