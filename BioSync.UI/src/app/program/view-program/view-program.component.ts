import {Component, Output, EventEmitter, Input, OnInit,} from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ViewProgramService } from '../../../services/view-program.service';
import { Program } from '../../../model/program.model';

@Component({
  selector: 'app-view-program',
  standalone: true,
  imports: [MatToolbarModule, MatSelectModule],
  providers: [ViewProgramService],
  templateUrl: './view-program.component.html',
  styleUrl: './view-program.component.css'
})
export class ViewProgramComponent implements OnInit {
  @Output() backToViewProgram = new EventEmitter<void>();
  @Input() id!: number | undefined;

  program: Program = {
    id: 0,
    programName: "",
    programAbbreviation: "",
    programDescription: ""
  };

  constructor(private viewProgramService: ViewProgramService) {}

  ngOnInit() {
    this.getProgram();
  }

  getProgram() {
    this.viewProgramService.getProgram(+this.id!).subscribe({
      next: value => {
        this.program = value;
      }
    })
  }

  returnToProgramView(): void {
    this.backToViewProgram.emit();
  }
}
