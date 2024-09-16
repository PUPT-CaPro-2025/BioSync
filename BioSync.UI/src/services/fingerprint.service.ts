import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environment/app.setting";
import {CookieService} from "./cookie.service";

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

  verifyProfessorFingerprintForAttendance(formData: FormData){
    return this.http.post<string>(`${this.url}/verify/start`, formData, {
      headers: this.headers,
      withCredentials: true,
      responseType: 'text' as 'json'
    })
  }
}
