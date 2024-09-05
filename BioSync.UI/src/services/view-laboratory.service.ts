import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { Laboratory } from '../model/laboratory.model';
import {environment} from '../../environment/app.setting';
import {CookieService} from "./cookie.service";

@Injectable({
  providedIn: 'root'
})
export class ViewLaboratoryService {
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  getLaboratory(id: number) {
    const url = `${environment.apiUrl}/api/v1/laboratories/${id}`;
    return this.http.get<Laboratory>(url, {
      headers: this.headers,
      withCredentials: true,
    });
  }
}
