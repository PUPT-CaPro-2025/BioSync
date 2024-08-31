import {Component, Output, EventEmitter, Input, OnInit,} from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Section } from '../../model/section.model';
import { SectionComponent } from '../section/section.component';

@Component({
  selector: 'app-view-section',
  standalone: true,
  imports: [MatToolbarModule, MatSelectModule, SectionComponent],
  templateUrl: './view-section.component.html',
  styleUrl: './view-section.component.css'
})
export class ViewSectionComponent {
  @Output() backToViewSection = new EventEmitter<void>();
  @Input() id!: number | undefined;

  program: string = "BSIT - Bachelor of Science in Information Technology";
  year: string = "4";
  section: number = 1;

  returnToSectionView(): void {
    this.backToViewSection.emit();
  }
}
