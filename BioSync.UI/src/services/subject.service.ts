import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environment/appsetting";
import {Subject} from "../model/subject-model";
import {CookieService} from "./cookie.service";

@Injectable()
export class SubjectService {
  url = `${environment.apiUrl}/api/v1/subjects`
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  getSubjects(){
    return this.http.get<Subject[]>(this.url, {
      headers: this.headers,
      withCredentials: true
    });
  }

  updateSubject(subject: Subject){
    return this.http.put<Subject>(this.url, subject,{
      headers: this.headers,
      withCredentials: true
    })
  }

  deleteSubject(id: number | undefined) {
    return this.http.delete(this.url, {
      body: { id },
      headers: this.headers,
      withCredentials: true
    });
  }
}
