import {Component, Output, EventEmitter, Input, OnInit,} from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Laboratory } from '../../model/laboratory.model';
import { ViewLaboratoryService } from '../../services/view-laboratory.service';
import { LaboratoryComponent } from '../laboratory/laboratory.component';

@Component({
  selector: 'app-view-laboratory',
  standalone: true,
  imports: [MatToolbarModule, MatSelectModule, LaboratoryComponent],
  providers: [ViewLaboratoryService],
  templateUrl: './view-laboratory.component.html',
  styleUrl: './view-laboratory.component.css'
})
export class ViewLaboratoryComponent implements OnInit{
  @Output() backToViewLaboratory = new EventEmitter<void>();
  @Input() id!: number | undefined;

  laboratory: Laboratory = {
    id: 0,
    name: "",
    roomCode: "",
    capacity: 0
  };

  constructor(private viewlaboratoryService: ViewLaboratoryService, 
    protected laboratoryComponent: LaboratoryComponent) {}

  ngOnInit() {
    this.getLaboratory();
  }

  getLaboratory() {
    this.viewlaboratoryService.getLaboratory(+this.id!).subscribe({
      next: value => {
        this.laboratory = value;
      }
    })
  }  

  returnToLaboratoryView(): void {
    this.backToViewLaboratory.emit();
  }
}
