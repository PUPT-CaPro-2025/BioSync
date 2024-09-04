import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environment/app.setting";
import {CookieService} from "./cookie.service";
import {SchoolYear} from "../model/school.year.model";

@Injectable()
export class SchoolYearService {
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);
  url = `${environment.apiUrl}/api/v1/school-year`;

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  getSchoolYears() {
    return this.http.get<SchoolYear[]>(this.url, {
      headers: this.headers,
      withCredentials: true,
    });
  }

  createSchoolYear(schoolYear: SchoolYear){
      return this.http.post<SchoolYear>(this.url, schoolYear, {
          headers: this.headers,
          withCredentials: true
      })
  }

  deleteSchoolYear(schoolYear: SchoolYear){
    return this.http.delete<SchoolYear>(this.url, {
      body: { "id" : schoolYear.id },
      headers: this.headers,
      withCredentials: true
    })
  }
}
