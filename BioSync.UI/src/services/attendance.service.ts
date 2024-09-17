import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environment/app.setting";
import {CookieService} from "./cookie.service";
import {Attendance} from "../model/attendance.model";

@Injectable()
export class AttendanceService {
  url = `${environment.apiUrl}/api/v1/attendance`;
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  getAttendanceByScheduleId(scheduleId: number){
    return this.http.get<Attendance[]>(`${this.url}/schedule/${scheduleId}`, {
      headers: this.headers,
      withCredentials: true
    })
  }

  getPresentCount(userId: number){
    return this.http.get<number>(`${this.url}/count/present/${userId}`, {
      headers: this.headers,
      withCredentials: true
    })
  }

  getAbsentCount(userId: number){
    return this.http.get<number>(`${this.url}/count/absent/${userId}`, {
      headers: this.headers,
      withCredentials: true
    })
  }
}
