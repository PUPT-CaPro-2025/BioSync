import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environment/app.setting";
import {CookieService} from "./cookie.service";
import {SchoolYear} from "../model/school.year.model";

@Injectable()
export class SchoolYearService {
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  getSchoolYears() {
    const url = `${environment.apiUrl}/api/v1/school-year`;
    return this.http.get<SchoolYear[]>(url, {
      headers: this.headers,
      withCredentials: true,
    });
  }
}
