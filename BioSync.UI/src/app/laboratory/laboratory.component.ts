import { Component, Input, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { AddLaboratoryComponent } from '../add-laboratory/add-laboratory.component';
import { EditLaboratoryComponent } from '../edit-laboratory/edit-laboratory.component';
import { LaboratoryService } from '../../services/laboratory.service';
import { Laboratory } from '../../model/laboratory.model';
import { MatDialog } from '@angular/material/dialog';
import {PromptConfirmComponent} from "../prompt-confirm/prompt-confirm.component";
import { ViewLaboratoryComponent } from '../view-laboratory/view-laboratory.component';
import jsPDF from "jspdf";

@Component({
  selector: 'app-laboratory',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
    CommonModule,
    AddLaboratoryComponent,
    EditLaboratoryComponent,
    ViewLaboratoryComponent
  ],
  providers: [LaboratoryService],
  templateUrl: './laboratory.component.html',
  styleUrl: './laboratory.component.css'
})
export class LaboratoryComponent implements OnInit {
  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Alphabetical', 'Date'
  ];

  laboratories: Laboratory[] = [];

  @Input() totalItems: number = 500;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  isAddLaboratory: boolean = false;
  isEditLaboratory: boolean = false;
  isViewLaboratory: boolean = false;
  laboratoryToEdit!: Laboratory;
  currentLaboratory: number | undefined;

  constructor(
    private laboratoryService: LaboratoryService,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.getLaboratories()
  }

  getLaboratories(){
    this.laboratoryService.getLaboratories().subscribe({
      next: (laboratories: Laboratory[]) => {
        laboratories.forEach((laboratory) => {
          this.laboratories.push(laboratory);
        })
      },
      error: (error) => { console.error(error) }
    }
    )
  }

  onLaboratoryAdded(newLaboratory: Laboratory){
    this.laboratories.push(newLaboratory);
  }

  onLaboratoryUpdate(updatedLaboratory: Laboratory) {
    const index = this.laboratories.findIndex(
      laboratory => laboratory.id === updatedLaboratory.id
    );

    if(index === -1) return;

    this.laboratories[index] = updatedLaboratory;
  }

  openDeleteDialog(laboratory: Laboratory): void {
    const dialogRef = this.dialog.open(PromptConfirmComponent, {
      width: '400px',
      data: {
        title: "Delete Laboratory",
        message: "Are you sure you want to delete this laboratory?"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteLaboratoryById(laboratory);
      }
    });
  }

  deleteLaboratoryById(laboratoryToDelete: Laboratory) {
    this.laboratoryService.deleteLaboratoryById(laboratoryToDelete).subscribe({
      next: () => {
        this.laboratories = this.laboratories.filter(laboratory => laboratory.id !== laboratoryToDelete.id);
      },
      error: err => console.error(err)
    });
  }

  get filteredLaboratories(): Laboratory[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.laboratories.slice(startIndex, endIndex);
  }

  get pages(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end}`;
  }

  onPageChange(): void {
    // Handle page change logic here
  }

  onItemsPerPageChange(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.onPageChange();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.onPageChange();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.onPageChange();
    }
  }

  toggleAddLaboratory(): void {
    this.isAddLaboratory = !this.isAddLaboratory;
  }

  handleBackToLaboratory(): void {
    this.isAddLaboratory = false;
  }

  toggleEditLaboratory(laboratory: Laboratory): void {
    this.isEditLaboratory = !this.isEditLaboratory;
    this.laboratoryToEdit = laboratory;
  }

  handleBackToEditLaboratory(): void {
    this.isEditLaboratory = false;
  }

  toggleViewLaboratory(laboratoryId: number | undefined): void {
    this.isViewLaboratory = !this.isViewLaboratory;
    if(this.isViewLaboratory){
      this.currentLaboratory = laboratoryId;
    }
  }

  setViewId(){
    return this.currentLaboratory;
  }

  handleBackToViewLaboratory(): void {
    this.isViewLaboratory = false;
  }

  generatePdf() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('List of Laboratories', 14, 20);

    doc.setFontSize(12);
    doc.text('Generated on: ' + new Date().toLocaleDateString(), 14, 30);

    const columns = ['Room Code', 'Laboratory Name', 'Capacity'];
    const rows = this.laboratories.map(laboratory =>
      [
        laboratory.roomCode,
        laboratory.name,
        laboratory.capacity
      ]);

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 10,
        halign: 'center',
      },
      headStyles: {
        fillColor: [248, 76, 66],
        textColor: 255,
        fontSize: 12
      },
      bodyStyles: {
        fontSize: 10
      }
    });

    doc.save('laboratory-list.pdf');
  }
}
