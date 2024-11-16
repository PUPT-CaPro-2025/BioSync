import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { Program } from '../../../model/program.model';
import { ProgramService } from '../../../services/program.service';
import { MatDialog } from '@angular/material/dialog';
import {PromptOkayComponent} from "../../prompt/prompt-okay/prompt-okay.component";

@Component({
  selector: 'app-edit-program',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
  ],
  providers: [ProgramService],
  templateUrl: './edit-program.component.html',
  styleUrl: './edit-program.component.css'
})
export class EditProgramComponent implements OnInit{
  @Output() backToEditProgram = new EventEmitter<void>();
  @Output() updatedProgram = new EventEmitter<Program>();
  @Input() selectedProgram!: Program;
  programForm!: FormGroup;

  constructor(private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private programService: ProgramService
  ) {}

  ngOnInit() {
    this.initForm();
    this.setFormValue();
  }

  initForm(){
    this.programForm = this.formBuilder.group({
      id: [],
      programName: ['', [Validators.required]],
      programAbbreviation: ['', [Validators.required]],
      programDescription: ['', Validators.required]
    });
  }

  setFormValue(){
    this.programForm.patchValue({
      id: this.selectedProgram.id,
      programName: this.selectedProgram.programName,
      programAbbreviation: this.selectedProgram.programAbbreviation,
      programDescription: this.selectedProgram.programDescription,
    })
  }

  returnToProgramView(): void {
    this.backToEditProgram.emit();
  }

  submit() {
    if(!this.programForm.touched || !this.programForm.valid) return;

    const programToUpdate = this.programForm.value;

    this.programService.updateProgram(programToUpdate).subscribe({
      next: (programUpdated: Program) => {
        if(!programUpdated.id) return;
        this.updatedProgram.emit(programUpdated);
        this.openSuccessDialog();
      }

    })
    return;
  }

  openSuccessDialog(){
    const ref = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Program Updated!',
        message: 'Program details has been updated successfully.'
      }
    })

    ref.afterClosed().subscribe({
      next: () => {
        this.returnToProgramView();
      }
    })
  }
}
