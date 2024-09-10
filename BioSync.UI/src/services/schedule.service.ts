import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environment/app.setting";
import {Schedule} from "../model/schedule.model";
import {CookieService} from "./cookie.service";

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

  getAllSchedulesByProfessorId(professorId: number){
    return this.http.get<Schedule[]>(`${this.url}/professor/${professorId}`, {
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

  updateSchedule(schedule: Schedule){
    return this.http.put<Schedule>(this.url, schedule,{
      headers: this.headers,
      withCredentials: true
    })
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
    const date = new Date(`1970-01-01T${time}Z`);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  getDay(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }
}
