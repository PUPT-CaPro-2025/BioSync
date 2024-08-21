import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Schedule} from "../model/schedule-model";
import {environment} from "../../environment/appsetting";
import {CookieService} from "./cookie.service";

@Injectable({
  providedIn: 'root'
})
export class ViewScheduleService {
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  getSchedule(id: number) {
    const url = `${environment.apiUrl}/api/v1/schedules/${id}`;
    return this.http.get<Schedule>(url, {
      headers: this.headers,
      withCredentials: true,
    });
  }
}
