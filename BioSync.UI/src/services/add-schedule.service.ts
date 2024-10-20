import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environment/app.setting";
import {Schedule} from "../model/schedule.model";
import {CookieService} from "./cookie.service";

@Injectable()
export class AddScheduleService {
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  createSchedule(schedule: Schedule[]){
    const url = `${environment.apiUrl}/api/v1/schedules/create`;
    return this.http.post<Schedule[]>(url, schedule, {
      headers: this.headers,
      withCredentials: true
    });
  }

  detectConflict(schedule: Schedule) {
    const url = `${environment.apiUrl}/api/v1/schedules/conflicts`;
    return this.http.post<Schedule[]>(url, schedule, {
      headers: this.headers,
      withCredentials: true
    });
  }

}
