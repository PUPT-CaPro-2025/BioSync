import { Component, OnInit } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { Schedule } from '../../../model/schedule.model';
import { ActivatedRoute } from '@angular/router';
import { ScheduleService } from '../../../services/schedule.service';
import { AttendanceService } from '../../../services/attendance.service';
import { Attendance } from '../../../model/attendance.model';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-view-attendance',
  standalone: true,
  imports: [MatToolbar],
  providers: [ScheduleService, AttendanceService],
  templateUrl: './view-attendance.component.html',
  styleUrls: [
    './view-attendance.component.css',
    '../../schedule/schedule.component.css',
  ],
})
export class ViewAttendanceComponent implements OnInit {
  schedule!: Schedule;
  class: Attendance[] = [];
  headerImage!: string;
  constructor(
    private activatedRoute: ActivatedRoute,
    private scheduleService: ScheduleService,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.getScheduleDetails(+id!);
      this.getAttendance(+id!);
    });
  }

  getAttendance(scheduleId: number) {
    this.attendanceService.getAttendanceByScheduleId(scheduleId).subscribe({
      next: (value) => {
        this.class = value;
      },
    });
  }

  getScheduleDetails(scheduleId: number) {
    this.scheduleService.getScheduleById(scheduleId).subscribe({
      next: (value) => {
        this.schedule = value;
      },
    });

    this.loadImageToBase64('../../assets/header.png', (base64Image) => {
      this.headerImage = base64Image;
    });
  }

  convertTo12HourFormat(string: string) {
    return this.scheduleService.convertTimeFormat(string);
  }

  returnToSchoolYearView() {
    history.back();
  }

  generatePdf() {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    const imgWidth = 115;
    const imgHeight = 15;
    const xOffset = (pageWidth - imgWidth) / 2;
    doc.addImage(this.headerImage, 'PNG', xOffset, 5, imgWidth, imgHeight);

    const title = 'ATTENDANCE';
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 30, { align: 'center' });

    doc.setFontSize(10);
    const leftX = 20; 
    const rightX = pageWidth - 20; 
    let currentY = 40;
    const lineHeight = 6; 

    doc.setFont('helvetica', 'bold');
    doc.text('Course:', leftX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(this.schedule.subject?.description || '', leftX + 40, currentY);

    doc.setFont('helvetica', 'bold');
    doc.text('Date:', rightX - 40, currentY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(this.schedule.scheduleDate || '', rightX, currentY, {
      align: 'right',
    });
    currentY += lineHeight;

    doc.setFont('helvetica', 'bold');
    doc.text('Program & Year:', leftX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${this.schedule.section?.program?.programAbbreviation || ''} ${
        this.schedule.section?.section || ''
      }`,
      leftX + 40,
      currentY
    );

    doc.setFont('helvetica', 'bold');
    doc.text('Date/Time Printed:', rightX - 40, currentY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleString();
    doc.text(currentDate, rightX, currentY, { align: 'right' });

    const columns = ['Student Name', 'Status'];
    const rows = this.class.map((attendance) => [
      `${attendance.user.firstName} ${attendance.user.lastName}`,
      attendance.status,
    ]);

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: currentY + lineHeight + 5,
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
      },
    });

    doc.save(`attendance-${this.schedule.subject?.code}-${this.
      schedule.scheduleDate}.pdf`);
  }

  loadImageToBase64(
    url: string,
    callback: (base64Image: string) => void
  ): void {
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
