import { Visitor } from '../../model/visitor-model';
import {Component, Input, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditVisitorComponent } from '../edit-visitor/edit-visitor.component';

@Component({
  selector: 'app-visitor',
  standalone: true,
  imports: [MatToolbarModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    MatIconModule,
    EditVisitorComponent],
  templateUrl: './visitor.component.html',
  styleUrl: './visitor.component.css'
})
export class VisitorComponent {
  //Temporary Data
  visitors: Visitor[] = [
    { id: 1, visitor_name: "John Doe", visit: "Speaker", visit_date: "04/08/2024", details: "N/A", event: "Knights of Honor", destination: "DOST Laboratory", time_in: "7:30 AM", time_out: "10:30 AM" },
    { id: 2, visitor_name: "Rence Tenorio", visit: "Speaker", visit_date: "07/29/2024", details: "N/A", event: "Seminar", destination: "DOST Laboratory", time_in: "1:00 PM", time_out: "5:00 PM" },
    { id: 3, visitor_name: "Stan Smith", visit: "Speaker", visit_date: "02/16/2024", details: "N/A", event: "Seminar", destination: "Aboitiz Laboratory", time_in: "10:00 AM", time_out: "2:00 PM" }
  ];

  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Subject Code', 'Alphabetical', 'Date'
  ];

  @Input() totalItems: number = 500;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  isEditVisitor: boolean = false;

  get pages(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end}`;
  }

  get filteredVisitors(): Visitor[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.visitors.slice(startIndex, endIndex);
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

  toggleEditVisitor(): void {
    this.isEditVisitor = !this.isEditVisitor;
  }

  handleBackToEditVisitor(): void {
    this.isEditVisitor = false;
  }
}
