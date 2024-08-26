import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environment/appsetting";
import {CookieService} from "./cookie.service";
import {Section} from "../model/section.model";

@Injectable()
export class SectionService {
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  getSections() {
    const url = `${environment.apiUrl}/api/v1/sections`;
    return this.http.get<Section[]>(url, {
      headers: this.headers,
      withCredentials: true,
    });
  }
}
