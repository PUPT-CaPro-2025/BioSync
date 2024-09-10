import {Component, Input, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { Schedule } from '../../model/schedule.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddScheduleComponent } from '../add-schedule/add-schedule.component';
import { MatSelectModule } from '@angular/material/select';
import { EditScheduleComponent } from '../edit-schedule/edit-schedule.component';
import { ViewScheduleComponent } from '../view-schedule/view-schedule.component';
import {ScheduleService} from "../../services/schedule.service";
import {PromptConfirmComponent} from "../prompt-confirm/prompt-confirm.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, CommonModule, FormsModule, AddScheduleComponent, MatSelectModule, EditScheduleComponent, ViewScheduleComponent],
  providers: [ScheduleService],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css',
})

export class ScheduleComponent implements OnInit{
  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Subject Code', 'Alphabetical', 'Date'
  ];

  yearSemesters: string[] = [
    'School Year 2324 - First Semester', 'School Year 2324 - Second Semester', 'School Year 2324 - Summer'
  ];

  selectedYearSem = 'School Year 2324 - Summer';

  schedules: Schedule[] = [];

  @Input() totalItems: number = 500;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  isOneAddSchedule: boolean = false;
  isWeeklyAddSchedule: boolean = false;
  isEditSchedule: boolean = false;
  isViewSchedule: boolean = false;
  currentSchedule: number | undefined;
  groupedSchedules: { [key: string]: Schedule[] } = {};
  selectedSchedule!: Schedule;
  isDropdownOpenAddSchedule: boolean = false;

  constructor(
    private scheduleService: ScheduleService,
    private dialog: MatDialog,
    ) {}

  ngOnInit() {
    this.getAllSchedules();
  }

  getAllSchedules() {
    this.scheduleService.getAllSchedules().subscribe({
      next: (schedules) => {
        this.schedules = schedules;
        this.groupSchedulesByRecurrenceId();
        this.filteredRepeatedSchedules();
        this.sortSchedulesById(this.schedules);
      },
      error: (err) => console.error(err),
    });
  }

  sortSchedulesById(schedules: Schedule[]): Schedule[] {
    return schedules.sort((a, b) => b.id - a.id);
  }

  getRecurrenceDays(recId: string): string[] {
    const schedules = this.groupedSchedules[recId];
    if (schedules) {
      const daysSet = new Set<string>();
      schedules.forEach((schedule) => {
        schedule.recurrenceDays!.forEach((day: String) => daysSet.add(day.toString())); // Ensure `day` is of type `string`
      });
      return Array.from(daysSet);
    }
    return [];
  }

  onScheduleCreation(schedule: Schedule[]){
    schedule.forEach((schedule: Schedule) => {
      this.schedules.push(schedule);
    })
    this.groupSchedulesByRecurrenceId();
    this.filteredRepeatedSchedules();
    this.sortSchedulesById(this.schedules);
  }

  onScheduleUpdate(updatedSchedule: Schedule) {
    const index = this.schedules.findIndex(schedule =>
      schedule.id === updatedSchedule.id);

    this.schedules[index] = updatedSchedule;
    this.getAllSchedules();
  }

  convertTimeFormat(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);

    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 hours to 12
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes} ${period}`;
  }

  openDeleteDialog(schedule: Schedule): void {
    const dialogRef = this.dialog.open(PromptConfirmComponent, {
      width: '400px',
      data: {
        title: 'Delete Schedule',
        message: 'Are you sure you want to delete this schedule?',
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteSchedule(schedule);
      }
    });
  }

  getDayOfWeek(date: string | Date): string {
    const newDate = new Date(date);
    const days = ['SUN', 'MON', 'TUE', 'WED',
      'THU', 'FRI', 'SAT'];
    return days[newDate.getDay()];
  }

  deleteSchedule(scheduleToDelete: Schedule){
    this.scheduleService.deleteSchedule(scheduleToDelete)
      .subscribe({
        next: () => {
          this.schedules = this.schedules.filter(
            schedule => schedule.id !== scheduleToDelete.id
          )
        }
      })
  }

  get pages(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end}`;
  }

  get filteredSchedules(): Schedule[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.schedules.slice(startIndex, endIndex);
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

  toggleOneAddSchedule(): void {
    this.isDropdownOpenAddSchedule = false;
    this.isOneAddSchedule = !this.isOneAddSchedule;
  }

  toggleWeeklyAddSchedule(): void {
    this.isDropdownOpenAddSchedule = false;
    this.isWeeklyAddSchedule = !this.isWeeklyAddSchedule;
  }

  handleBackToSchedule(): void {
    this.isOneAddSchedule = false;
    this.isWeeklyAddSchedule = false;
  }

  toggleEditSchedule(schedule: Schedule): void {
    this.isEditSchedule = !this.isEditSchedule;
    this.selectedSchedule = schedule;
  }

  handleEditBackToSchedule(): void {
    this.isEditSchedule = false;
  }

  toggleViewSchedule(scheduleId: number | undefined): void {
    this.isViewSchedule = !this.isViewSchedule;

    if(this.isViewSchedule){
      this.currentSchedule = scheduleId;
    }
  }

  setViewId(){
    return this.currentSchedule;
  }

  handleViewBackToSchedule(): void {
    this.isViewSchedule = false;
  }

  filteredRepeatedSchedules(): void {
    const filteredSchedules: Schedule[] = [];
    const recurrenceIdStorage: string[] = [];
    this.schedules.forEach(schedule => {
      if (schedule.recurrenceId != null) {
        if(!recurrenceIdStorage.includes(schedule.recurrenceId)) {
          recurrenceIdStorage.push(schedule.recurrenceId);
          filteredSchedules.push(schedule);
        }
      } else {
        filteredSchedules.push(schedule);
      }
    })

    this.schedules = filteredSchedules;
  }

  groupSchedulesByRecurrenceId() {
    this.groupedSchedules = this.schedules.reduce((acc, schedule) => {
      if (schedule.recurrenceId) {
        if (!acc[schedule.recurrenceId]) {
          acc[schedule.recurrenceId] = [];
        }
        acc[schedule.recurrenceId].push(schedule);
      }
      return acc;
    }, {} as { [key: string]: Schedule[] });
  }

  onAddScheduleClick() {
    this.isDropdownOpenAddSchedule = !this.isDropdownOpenAddSchedule;

  }
}
