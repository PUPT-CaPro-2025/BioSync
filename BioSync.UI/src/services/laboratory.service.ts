import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environment/appsetting";
import {CookieService} from "./cookie.service";
import {SchoolYear} from "../model/school.year.model";
import {Laboratory} from "../model/laboratory.model";

@Injectable()
export class LaboratoryService {
  url = `${environment.apiUrl}/api/v1/laboratories`;
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  getLaboratories() {
    return this.http.get<Laboratory[]>(this.url, {
      headers: this.headers,
      withCredentials: true,
    });
  }

  updateLaboratory(laboratories: Laboratory){
    return this.http.put<Laboratory>(this.url, laboratories,{
      headers: this.headers,
      withCredentials: true
    })
  }

  deleteLaboratoryById(laboratories: Laboratory){
    return this.http.delete<Laboratory>(this.url, {
      body: { "id" : laboratories.id },
      headers: this.headers,
      withCredentials: true
    });
  }
}
