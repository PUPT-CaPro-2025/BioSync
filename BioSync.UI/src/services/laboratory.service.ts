import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environment/appsetting";
import {CookieService} from "./cookie.service";
import {SchoolYear} from "../model/school.year.model";
import {Laboratory} from "../model/laboratory.model";

@Injectable()
export class LaboratoryService {
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  getLaboratories() {
    const url = `${environment.apiUrl}/api/v1/laboratories`;
    return this.http.get<Laboratory[]>(url, {
      headers: this.headers,
      withCredentials: true,
    });
  }
}
