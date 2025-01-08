import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environment/app.setting";
import {CookieService} from "./cookie.service";
import {Section} from "../model/section.model";

@Injectable()
export class SectionService {
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);
  url = `${environment.apiUrl}/api/v1/sections`;

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  getSections() {
    return this.http.get<Section[]>(this.url, {
      headers: this.headers,
      withCredentials: true,
    });
  }

  getSectionByProgramId(programId: number) {
    return this.http.get<Section[]>(`${this.url}/program/${programId}`, {
      headers: this.headers,
      withCredentials: true,
    })
  }

  addSection(section: Section) {
    return this.http.post<Section>(this.url, section, {
      headers: this.headers,
      withCredentials: true
    })
  }

  deleteSection(section: Section) {
    return this.http.delete<Section>(this.url, {
      body: { id: section.id },
      headers: this.headers,
      withCredentials: true
    })
  }
}
