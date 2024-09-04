import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { ProgramService } from '../../services/program.service';
import { Program } from '../../model/program.model';
import {SectionService} from "../../services/section.service";
import {Section} from "../../model/section.model";
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../prompt-okay/prompt-okay.component";

@Component({
  selector: 'app-add-section',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule
  ],
  providers: [
    ProgramService,
    SectionService
  ],
  templateUrl: './add-section.component.html',
  styleUrl: './add-section.component.css'
})
export class AddSectionComponent implements OnInit {
  sectionForm!: FormGroup;
  @Output() backToSection = new EventEmitter<void>();
  @Output() sectionAdded = new EventEmitter<Section>();

  years: string[] = [
    '1', '2', '3', '4', '5', 'Ladderized'
  ];

  sections: string[] =[
    '1', '2', '3', '4', '5'
  ];

  programs: Program[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private programService: ProgramService,
    private sectionService: SectionService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.getAllPrograms();
    this.initForm();
  }

  initForm(){
    this.sectionForm = this.formBuilder.group({
      program: ['', [Validators.required]],
      year: ['', [Validators.required]],
      section: ['', Validators.required]
    });
  }

  getAllPrograms() {
    this.programService.getAllPrograms().subscribe({
      next: programs => {
        this.programs = programs;
      }
    })
  }

  returnToSectionView(): void {
    this.backToSection.emit();
  }

  submit(){
    if(this.sectionForm.invalid) return;

    this.sectionService.addSection(this.sectionForm.value).subscribe({
      next: (section: Section) => {
        if(!section.id) return;
        this.sectionAdded.emit(section);
        this.openConfirmationModal();
      }
    })
  }

  openConfirmationModal(){
    const ref = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Section Added!',
        message: 'Section has been added successfully.'
      }
    })

    ref.afterClosed().subscribe({
      next: () => {
        this.returnToSectionView();
      }
    })
  }


}
