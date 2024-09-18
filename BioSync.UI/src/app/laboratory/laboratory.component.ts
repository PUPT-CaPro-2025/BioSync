import { Component, Input, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { AddLaboratoryComponent } from '../add-laboratory/add-laboratory.component';
import { EditLaboratoryComponent } from '../edit-laboratory/edit-laboratory.component';
import { LaboratoryService } from '../../services/laboratory.service';
import { Laboratory } from '../../model/laboratory.model';
import { MatDialog } from '@angular/material/dialog';
import {PromptConfirmComponent} from "../prompt-confirm/prompt-confirm.component";
import jsPDF from "jspdf";
import {ViewLaboratoryComponent} from "../view-laboratory/view-laboratory.component";

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
    EditLaboratoryComponent, ViewLaboratoryComponent
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
  headerImage!: string;

  constructor(
    private laboratoryService: LaboratoryService,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.getLaboratories();

    this.loadImageToBase64('../../assets/header.png', (base64Image) => {
      this.headerImage = base64Image;
    });
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
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const imgWidth = 115; // Width of the image in mm
    const imgHeight = 15; // Adjust the height accordingly
    const xOffset = (pageWidth - imgWidth) / 2; // Calculate the xOffset to center the image
    doc.addImage(this.headerImage, 'PNG', xOffset, 5, imgWidth, imgHeight);

    // Add Title and Date/Time only on the first page
    const title = 'LABORATORY LIST';
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 30, { align: 'center' }); // Center aligned header

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Date/Time Printed:', pageWidth / 2.1, 35, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleString();
    doc.text(currentDate, pageWidth / 2, 35);
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
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineWidth: 0.4,
        lineColor: [0, 0, 0],
      },
      bodyStyles: {
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
      }
    });

    doc.save('laboratory-list.pdf');
  }

  loadImageToBase64(url: string, callback: (base64Image: string) => void): void {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      const base64Image = canvas.toDataURL('image/png');
      callback(base64Image);
    };
  }
}
