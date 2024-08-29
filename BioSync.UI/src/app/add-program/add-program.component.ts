import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { AddProgramService } from '../../services/add-program.service';
import { Program } from '../../model/program.model';
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../prompt-okay/prompt-okay.component";

@Component({
  selector: 'app-add-program',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
  ],
  providers: [AddProgramService],
  templateUrl: './add-program.component.html',
  styleUrl: './add-program.component.css'
})
export class AddProgramComponent implements OnInit {
  programForm!: FormGroup;
  @Output() backToProgram = new EventEmitter<void>();
  @Output() programAdded = new EventEmitter<Program>();

  constructor(private formBuilder: FormBuilder, 
    private addProgramService: AddProgramService,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.programForm = this.formBuilder.group({
      programName: ['', [Validators.required]],
      programAbbreviation: ['', [Validators.required]],
      programDescription: ['', Validators.required]
    });
  }

  submit(){
    if(!this.programForm.valid) {
      console.log('invalid');
      return;
    }

    const program = this.programForm.value;
    this.addProgramService.createProgram(program).subscribe({
      next: (program: Program) => {
        console.log(program);
        this.programForm.reset();
        this.openDialog();
        this.programAdded.emit(program);
      },
      error: err => console.error(err)
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Program Successfully Added!',
        message: 'Program has been added to the system successfully.'
      }
    })

    dialogRef.afterClosed().subscribe(() => {
      this.backToProgram.emit();
    })
  }
}
