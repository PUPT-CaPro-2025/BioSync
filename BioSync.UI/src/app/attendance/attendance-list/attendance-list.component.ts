import {Component, OnInit} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatToolbar} from "@angular/material/toolbar";
import {Schedule} from "../../../model/schedule.model";
import {ScheduleService} from "../../../services/schedule.service";
import {ActivatedRoute, Router} from "@angular/router";
import jsPDF from "jspdf";
import {CryptoService} from "../../../services/crypto.service";
import {CookieService} from "../../../services/cookie.service";
import {AttendanceService} from "../../../services/attendance.service";
import {Attendance} from "../../../model/attendance.model";
import {forkJoin} from "rxjs";

@Component({
  selector: 'app-attendance-list',
  standalone: true,
    imports: [
        MatIcon,
        MatToolbar
    ],
    providers: [ScheduleService, AttendanceService],
  templateUrl: './attendance-list.component.html',
  styleUrl: './attendance-list.component.css'
})
export class AttendanceListComponent implements OnInit{
    schedules: Schedule[] = [];
    schedule!: Schedule;
    recurrenceId: string | null | undefined;
    today: number;
    headerImage!: string;
    reportDropdown = false;
    class: Attendance[] = [];

    constructor(
        private scheduleService: ScheduleService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private cryptoService: CryptoService,
        private cookieService: CookieService,
        private attendanceService: AttendanceService,
    ) {
        this.today = new Date().setHours(0, 0, 0, 0);
    }

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe(params => {
            this.recurrenceId = params.get('id');
            if(this.recurrenceId)
                this.getSchedulesByRecurrenceId(this.recurrenceId!);
        });

        this.loadImageToBase64('../../assets/header.png', (base64Image) => {
            this.headerImage = base64Image;
        });
    }

    getSchedulesByRecurrenceId(recurrenceId: string) {
        this.scheduleService.getSchedulesByRecurrenceId(recurrenceId).subscribe({
            next: (schedules: Schedule[]) => {
                const today = this.today;

                const finishedSchedules = schedules.filter(schedule =>
                    schedule.hasFinished && new Date(schedule.scheduleDate).getTime() >= today
                );

                finishedSchedules.sort((a, b) => new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime());

                this.schedules = [...finishedSchedules];

                this.schedule = schedules[0];

                console.log(this.schedules);

                this.schedules.forEach(schedule => {
                    console.log(schedule.id)
                    this.getAttendance(schedule.id) // gets the class[] which
                    // contains the time in and time out of students per schedule

                    console.log(this.class)
                })
            }
        });
    }

    getDayOfWeek(date: string | Date) {
        return this.scheduleService.getDayOfWeek(date);
    }

    convertTimeFormat(time: string) {
        return this.scheduleService.convertTimeFormat(time);
    }

    toggleStartSchedule(schedule: Schedule) {
        this.router.navigate(['/view/attendance', schedule.id]).then();
    }

    toggleDropdown() {
        this.reportDropdown = !this.reportDropdown;
    }

    loadImageToBase64(
        url: string,
        callback: (base64Image: string) => void,
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

    convertTo12HourFormat(string: string) {
        return this.scheduleService.convertTimeFormat(string);
    }

    getRole(): string {
        const encryptedRole = <string>decodeURIComponent(this.cookieService.getCookie("role")!);
        return this.cryptoService.decrypt(encryptedRole);
    }

    formatTime(timestamp: string | null): string {
        if (!timestamp) return '-'; // Handle null or undefined timestamps
        const date = new Date(timestamp);

        // Convert to 12-hour format
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0'); // Add leading zero
        const ampm = hours >= 12 ? 'PM' : 'AM'; // Determine AM/PM

        hours = hours % 12 || 12; // Convert to 12-hour format (0 becomes 12)

        return `${hours}:${minutes} ${ampm}`;
    }


    getAttendance(scheduleId: number) {
        this.attendanceService.getAttendanceByScheduleId(scheduleId).subscribe({
            next: (value) => {
                console.log(value[1])
            },
        });
    }

    populateRows(printType: string) {
        const uniqueDates = [...new Set(this.schedules.map(schedule => schedule.scheduleDate))];

        // Prepare an array of observables for fetching attendance data for each schedule
        const attendanceObservables = this.schedules.map(schedule =>
            this.attendanceService.getAttendanceByScheduleId(schedule.id)
        );

        // Fetch all attendance data simultaneously
        forkJoin(attendanceObservables).subscribe({
            next: (attendanceDataArray) => {
                // Combine all attendance data into a single array
                const allAttendance = attendanceDataArray.flat();

                // Group attendance by student
                const attendanceByStudent = new Map();


                allAttendance.forEach(record => {
                    const userFullName = `${record.user.firstName} ${record.user.lastName}`;

                    if (!attendanceByStudent.has(userFullName)) {
                        // Initialize an empty array for the student
                        attendanceByStudent.set(userFullName, {});
                    }

                    // Map attendance for the specific date
                    attendanceByStudent.get(userFullName)[record.schedule.scheduleDate] = {
                        timeIn: this.formatTime(record.timeIn)  || '-',
                        timeOut: this.formatTime(record.timeOut) || '-',
                    };
                });

                // Build rows
                const rows = Array.from(attendanceByStudent.entries()).map(([name, dates], index) => {
                    const row = [index + 1, name];

                    let presentCount = 0;
                    let absentCount = 0;

                    uniqueDates.forEach(date => {
                        if (dates[date]) {
                            const timeIn = dates[date].timeIn;
                            const timeOut = dates[date].timeOut;

                            if (timeIn !== '-' && timeOut !== '-') {
                                presentCount++;
                            } else {
                                absentCount++;
                            }

                            row.push(`${timeIn} - ${timeOut}`);
                        } else {
                            row.push('-');
                            absentCount++;
                        }
                    });

                    row.push(presentCount);
                    row.push(absentCount);

                    return row;
                });

                if(printType === "pdf"){
                    this.generatePdf(rows, uniqueDates);
                } else {
                    this.generateCsv(rows, uniqueDates);
                }
            },
            error: (error) => {
                console.error('Error fetching attendance:', error);
            },
        });
    }

    generatePdf(rows: any[], uniqueDates: string[]) {
        const doc = new jsPDF('landscape', 'mm', [215.9, 330.2]);
        const pageWidth = doc.internal.pageSize.getWidth();

        const imgWidth = 115;
        const imgHeight = 15;
        const xOffset = (pageWidth - imgWidth) / 2;

        const leftX = 20;
        const rightX = pageWidth - 20;
        const lineHeight = 6;

        // Headers
        const headerRow1 = ['No.', 'Date', ...uniqueDates, " ", " "];
        const headerRow2 = [' ', 'Name', ...uniqueDates.flatMap(() => ['Time' +
        ' In' +
        ' - Time Out']), 'Present', "Absent"];

        // Function to render header (will be called on each page)
        const renderHeader = (currentPage: number, pageCount: number) => {
            // Header image and title
            doc.addImage(this.headerImage, 'PNG', xOffset, 5, imgWidth, imgHeight);

            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('ATTENDANCE', pageWidth / 2, 30, { align: 'center' });

            let currentY = 40;

            doc.setFontSize(10);
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
            doc.text('Faculty:', leftX, currentY);
            doc.setFont('helvetica', 'normal');
            doc.text(
                `${this.schedule.professor?.firstName} ${this.schedule.professor?.lastName}` || '',
                leftX + 40,
                currentY,
            );

            doc.setFont('helvetica', 'bold');
            doc.text('Start/End Time:', rightX - 40, currentY, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            doc.text(
                `${this.convertTo12HourFormat(this.schedule.startTime)} - ${this.convertTo12HourFormat(this.schedule.endTime)}` || '',
                rightX,
                currentY,
                {
                    align: 'right',
                },
            );
            currentY += lineHeight;

            doc.setFont('helvetica', 'bold');
            doc.text('Program & Year:', leftX, currentY);
            doc.setFont('helvetica', 'normal');
            doc.text(
                `${this.schedule.section?.program?.programAbbreviation || ''} ${
                    this.schedule.section?.section || ''
                }`,
                leftX + 40,
                currentY,
            );

            doc.setFont('helvetica', 'bold');
            doc.text('Date/Time Printed:', rightX - 40, currentY, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            const currentDate = new Date().toLocaleString();
            doc.text(currentDate, rightX, currentY, { align: 'right' });

        };

        doc.autoTable({
            head: [headerRow1, headerRow2],
            body: rows,
            startY: 70,
            theme: 'grid',
            styles: {
                fontSize: 10,
                halign: 'center',
                cellWidth: 'wrap',
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
            columnStyles: {
                0: { cellWidth: 'auto' },
                [headerRow2.length - 1]: { cellWidth: 'auto' },
            },
            margin: { top: 65 },
            didDrawPage: (data: { pageNumber: number; pageCount: number }) => {
                // Render the header
                renderHeader(data.pageNumber, doc.getNumberOfPages());

                const currentPage = data.pageNumber;
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(
                    `Page ${currentPage}`,
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            },
        });

        // Save the PDF
        doc.save(
            `attendance-${this.schedule.subject?.code}-${
                this.schedule.scheduleDate
            }.pdf`,
        );
    }

    generateCsv(rows: any[], uniqueDates: string[]) {
        const csvRows: string[] = [];

        // Add header rows (headerRow1 and headerRow2)
        const headerRow1 = ['No.', 'Date', ...uniqueDates, ' ', ' '];
        const headerRow2 = [
            ' ',
            'Name',
            ...uniqueDates.flatMap(() => ['Time In - Time Out']),
            'Present',
            'Absent',
        ];

        // Add header rows to CSV
        csvRows.push(headerRow1.join(',')); // Convert array to comma-separated string
        csvRows.push(headerRow2.join(','));

        // Add data rows
        rows.forEach(row => {
            csvRows.push(row.join(',')); // Convert each row to comma-separated string
        });

        // Create CSV content
        const csvContent = csvRows.join('\n'); // Join rows with newline characters

        // Create a Blob and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `attendance-${this.schedule.subject?.code}-${this.schedule.scheduleDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }



}
