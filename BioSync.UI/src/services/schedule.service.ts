import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environment/app.setting";
import {Schedule} from "../model/schedule.model";
import {CookieService} from "./cookie.service";
import {ClassResponse} from "../model/class.model";

@Injectable()
export class ScheduleService {
  url = `${environment.apiUrl}/api/v1/schedules`
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  getAllSchedules(){
    return this.http.get<Schedule[]>(this.url, {
      headers: this.headers,
      withCredentials: true
    });
  }

  getScheduleById(scheduleId: number){
    return this.http.get<Schedule>(`${this.url}/${scheduleId}`,{
      headers: this.headers,
      withCredentials: true
    });
  }

  getAllSchedulesByProfessorId(professorId: number){
    return this.http.get<Schedule[]>(`${this.url}/professor/${professorId}`, {
      headers: this.headers,
      withCredentials: true
    })
  }

  getAllRequestedSchedules(requestId: number){
    return this.http.get<Schedule[]>(`${this.url}/professor/requests/${requestId}`, {
      headers: this.headers,
      withCredentials: true
    })
  }

  getAllPendingSchedules(){
    return this.http.get<Schedule[]>(`${this.url}/pending`, {
      headers: this.headers,
      withCredentials: true
    })
  }

  processScheduleDecision(schedule: Schedule, status: string){
    const body = { status: status };
    return this.http.patch<Schedule>(`${this.url}/${schedule.id}?status=${status}`, body, {
      headers: this.headers,
      withCredentials: true
    })
  }

  getAllSchedulesBySectionId(sectionId: number){
    return this.http.get<Schedule[]>(`${this.url}/section/${sectionId}`, {
      headers: this.headers,
      withCredentials: true
    })
  }

  getStudentsSchedule(studentId: number){
    return this.http.get<Schedule[]>(`${this.url}/role/student/${studentId}`, {
      headers: this.headers,
      withCredentials: true
    })
  }

  getSchedulesByRecurrenceId(recurrenceId: string | null) {
    return this.http.get<Schedule[]>(`${this.url}/recurrence/${recurrenceId}`, {
      headers: this.headers,
      withCredentials: true
    });
  }

  updateSchedule(schedule: Schedule){
    return this.http.put<Schedule>(this.url, schedule,{
      headers: this.headers,
      withCredentials: true
    })
  }

  setComputerNumber(scheduleStudent: ClassResponse){
    return this.http.put<Schedule>(`${this.url}/students/computer`, scheduleStudent, {
      headers: this.headers,
      withCredentials: true
    });
  }

  deleteSchedule(schedule: Schedule){
    return this.http.delete<Schedule>(this.url, {
      body: { "id" : schedule.id },
      headers: this.headers,
      withCredentials: true
    });
  }

  getMonth(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: 'long' };
    return date.toLocaleDateString(undefined, options);
  }

  getTime12HourFormat(time: string): string {
    const date = new Date(`1970-01-01T${time}`);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  getDay(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }

  convertTimeFormat(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);

    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes} ${period}`;
  }

  getDayOfWeek(date: string | Date): string {
    const newDate = new Date(date);
    const days = ['SUN', 'MON', 'TUE', 'WED',
      'THU', 'FRI', 'SAT'];
    return days[newDate.getDay()];
  }
}
