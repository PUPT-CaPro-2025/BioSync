import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environment/app.setting";
import {CookieService} from "./cookie.service";
import {Timein} from "../model/timein.model";
import {Schedule} from "../model/schedule.model";


@Injectable({
  providedIn: 'root'
})
export class FingerprintService {
  url = `${environment.apiUrl}/api/v1/attendance`;
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  registerFingerprint(formData: FormData){
    return this.http.post(`${environment.apiUrl}/api/v1/fingerprints/upload`, formData, {
      headers: this.headers,
      withCredentials: true,
      responseType: 'text' as 'json'
    })
  }

  verifyProfessorFingerprintForAttendance(formData: FormData){
    return this.http.post<string>(`${this.url}/verify/start`, formData, {
      headers: this.headers,
      withCredentials: true,
      responseType: 'text' as 'json'
    })
  }

  verifyStudentTimeInAttendance(formData: FormData) {
    return this.http.post<Timein>(`${this.url}/student/check-in`, formData, {
      headers: this.headers,
      withCredentials: true,
    })
  }

  stopAttendance(schedule: Schedule){
    return this.http.post<string>(`${this.url}/verify/stop?scheduleId=${schedule.id}`,null, {
      headers: this.headers,
      withCredentials: true,
      responseType: 'text' as 'json'
    })
  }


}
