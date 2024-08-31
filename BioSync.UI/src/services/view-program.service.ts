import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { Program } from '../model/program.model';
import {environment} from "../../environment/appsetting";
import {CookieService} from "./cookie.service";

@Injectable({
  providedIn: 'root'
})
export class ViewProgramService {
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  getProgram(id: number) {
    const url = `${environment.apiUrl}/api/v1/programs/${id}`;
    return this.http.get<Program>(url, {
      headers: this.headers,
      withCredentials: true,
    });
  }
}
