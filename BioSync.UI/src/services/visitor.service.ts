import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Schedule} from "../model/schedule-model";
import {environment} from "../../environment/appsetting";
import {CookieService} from "./cookie.service";
import {Visitor} from "../model/visitor.model";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class VisitorService {
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);
  url: string = `${environment.apiUrl}/api/v1/visitors`;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  logVisitor(visitor: Visitor) {
    return this.http.post<Visitor>(this.url, visitor);
  }

  getVisitors(visitors: Visitor[]): Observable<Visitor[]> {
    return this.http.get<Visitor[]>(this.url, {
      headers: this.headers,
      withCredentials: true
    })
  }

  updateVisitor(visitor: Visitor) {
    return this.http.put<Visitor>(this.url, {
      headers: this.headers,
      withCredentials: true
    })
  }

  deleteVisitor(visitor: Visitor) {
    return this.http.delete<Visitor>(this.url, {
      headers: this.headers,
      withCredentials: true
    })
  }
}
