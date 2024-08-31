import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Subject} from "../model/subject-model";
import {environment} from "../../environment/app.setting";
import {CookieService} from "./cookie.service";

@Injectable()
export class AddSubjectService {
  url = `${environment.apiUrl}/api/v1/subjects`;
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  createSubject(subject: Subject){
    return this.http.post<Subject>(this.url, subject, {
      withCredentials: true,
      headers: this.headers
    });
  }



}
