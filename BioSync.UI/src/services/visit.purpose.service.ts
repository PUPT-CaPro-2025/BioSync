import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environment/app.setting";
import {CookieService} from "./cookie.service";
import {VisitPurpose} from "../model/visit.purpose.model";

@Injectable()
export class VisitPurposeService {
  url: string = `${environment.apiUrl}/api/v1/visit-purposes`;
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  getVisitPurposes(){
    return this.http.get<VisitPurpose[]>(this.url, {
      headers: this.headers,
      withCredentials: true
    })
  }

  addPurpose(purpose: VisitPurpose){
    return this.http.post<VisitPurpose>(this.url, purpose, {
      headers: this.headers,
      withCredentials: true
    })
  }

  updatePurpose(purpose: VisitPurpose){
    return this.http.put<VisitPurpose>(this.url, purpose, {
      headers: this.headers,
      withCredentials: true
    })
  }

  deletePurpose(id: number){
    return this.http.delete(this.url, {
      body: { id: id },
      headers: this.headers,
      withCredentials: true
    })
  }
}
