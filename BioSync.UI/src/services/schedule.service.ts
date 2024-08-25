import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environment/appsetting";
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

  deleteSchedule(schedule: Schedule){
    return this.http.delete<Schedule>(this.url, {
      body: { "id" : schedule.id },
      headers: this.headers,
      withCredentials: true
    });
  }
}
